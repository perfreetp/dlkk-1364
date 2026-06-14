export const checkLinkValidity = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return false;
    }
    return false;
  }
};

export const checkLinksBatch = async (
  urls: string[]
): Promise<Map<string, boolean>> => {
  const results = new Map<string, boolean>();
  const batchSize = 5;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const promises = batch.map((url) =>
      checkLinkValidity(url)
        .then((valid) => results.set(url, valid))
        .catch(() => results.set(url, false))
    );
    await Promise.allSettled(promises);
  }

  return results;
};
