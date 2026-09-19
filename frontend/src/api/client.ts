import axios from 'axios';
import {
  HealthResponse,
  IngestProfileResponse,
  IngestJDResponse,
  JRSResponse,
  RetrievalQueryResponse,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const checkApiHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};

export const ingestResumeFile = async (
  file: File,
  githubUrl?: string
): Promise<IngestProfileResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const params = githubUrl ? `?github_url=${encodeURIComponent(githubUrl)}` : '';
  const response = await apiClient.post<IngestProfileResponse>(
    `/profile/ingest${params}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
};

export const ingestJobDescription = async (
  rawText: string,
  title?: string,
  company?: string
): Promise<IngestJDResponse> => {
  const response = await apiClient.post<IngestJDResponse>('/jd/ingest', {
    raw_text: rawText,
    title: title || 'Target Role',
    company: company || 'Target Company',
  });
  return response.data;
};

export const calculateJRS = async (
  candidateId: string,
  jdId: string,
  retrievalMode: string = 'hybrid_reranked',
  alpha: number = 0.65
): Promise<JRSResponse> => {
  const response = await apiClient.post<JRSResponse>('/jrs/calculate', {
    candidate_id: candidateId,
    jd_id: jdId,
    retrieval_mode: retrievalMode,
    alpha,
  });
  return response.data;
};

export const runRetrievalQuery = async (
  candidateId: string,
  query: string,
  mode: string = 'hybrid_reranked',
  topK: number = 5
): Promise<RetrievalQueryResponse> => {
  const response = await apiClient.post<RetrievalQueryResponse>('/retrieval/query', {
    candidate_id: candidateId,
    query,
    mode,
    top_k: topK,
  });
  return response.data;
};
