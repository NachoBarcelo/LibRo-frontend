import axios from 'axios';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data as { message?: string; error?: string } | undefined)?.message ??
      (error.response?.data as { message?: string; error?: string } | undefined)?.error ??
      error.message;
    return message || 'Error de red o servidor.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado.';
}
