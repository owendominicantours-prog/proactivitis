export const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  if (!res.ok) {
    const error = new Error("Error en la solicitud");
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};
