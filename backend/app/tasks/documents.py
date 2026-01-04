from sqlalchemy.orm.session import Session

from app.crud.document_crud import update_document_status
from app.models.document import Document

from sentence_transformers import SentenceTransformer

import fitz

import chromadb

from huggingface_hub import InferenceClient

client = InferenceClient(
    token="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"
)
model = SentenceTransformer("all-MiniLM-L6-v2")

chroma_client = chromadb.HttpClient(host='localhost', port=8000)

def process_document(db: Session, document: Document):
    try:
        update_document_status(db, document, "processing")

        # Read and chunk the file
        chunks = read_text_and_chunk(document)
        # Embedding
        vectors = embed_chunks(chunks)

        # Store vectors in ChromaDB
        store_vectors_in_chroma(vectors, chunks, document)

        update_document_status(db, document, "done")
    except Exception as e:
        update_document_status(db, document, "failed")
        print(f"Error processing document {document.id}: {e}")

def read_text_and_chunk(document: Document, chunk_size = 250, overlap = 50):
    doc = fitz.open(document.filepath)
    chunks = []
    for page in doc:
        text = page.get_text()
        words = text.split()
        start = 0
        while start < len(words):
            end = start + chunk_size
            chunk = " ".join(words[start:end])
            chunks.append({"text": chunk, "page": page.number})
            start += chunk_size - overlap

    return chunks

def embed_chunks(chunks: list[dict]):
    return model.encode([chunk["text"] for chunk in chunks], show_progress_bar=True)

def get_collection(tenant_id: str):
    return chroma_client.get_or_create_collection(name=tenant_id, metadata={"hnsw:space": "cosine"})

def store_vectors_in_chroma(vectors, chunks, document: Document):
    collection = get_collection(document.tenant_id)
    ids = [f"{document.id}_{i}" for i in range(len(chunks))]
    metadata = [
        {"doc_id": str(document.id), "chunk_id": i, "page": chunk["page"]}
        for i, chunk in enumerate(chunks)
    ]
    print(metadata, ids, chunks)
    collection.add(
        ids=ids,
        metadatas=metadata,
        embeddings=vectors,
        documents=[chunk["text"] for chunk in chunks],
    )

def query_document(tenant_id, query):
    collection = get_collection(tenant_id)
    query_embedding = embed_chunks([{"text": query}])
    results = collection.query(query_embeddings=query_embedding, n_results=5)
    print(results)
    documents = []
    metadatas = []
    sources = []
    for doc, meta, score in zip(results['documents'][0], results['metadatas'][0], results['distances'][0]):
        if score >= 0.45:  # pick a threshold that works for your embeddings
            documents.append(doc)
            metadatas.append(meta)
            sources.append({
                "document_id": meta['doc_id'],
                "page_no": meta.get('page', None),
                "chunk_id": meta['chunk_id'],
                "text": doc
            })
    llm_result = ask_llm(query, documents)
    return {"response": llm_result, "sources": sources}

def ask_llm(query, chunks):
    prompt = "Answer using only the context below:\n\n"
    for chunk in chunks:
        prompt += f"- {chunk}\n"
    prompt += f"\nQuestion: {query}\nAnswer:"

    print(prompt)
    response = client.chat_completion(
        model="google/gemma-2-2b-it",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    return response.choices[0].message.content