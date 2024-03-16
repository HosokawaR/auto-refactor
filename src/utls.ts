export const retry = async (
  func: () => Promise<void>,
  onError: (error: any, attemptsCount: number) => Promise<boolean>,
  onRetryExhausted: (error: any) => Promise<void>,
  maxAttemptsTime = 5,
) => {
  let attempts = 0;

  const execute = async () => {
    attempts += 1;
    try {
      await func();
    } catch (error) {
      const shouldRetry = await onError(error, attempts);
      if (shouldRetry && attempts <= maxAttemptsTime) {
        await sleep(5000);
        await execute();
      } else if (shouldRetry) {
        await onRetryExhausted(error);
      }
    }
  };

  await execute();
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
