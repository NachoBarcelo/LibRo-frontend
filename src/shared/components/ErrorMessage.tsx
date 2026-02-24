export function ErrorMessage({ message }: { message: string }) {
  return <p className="error">Error: {message}</p>;
}
