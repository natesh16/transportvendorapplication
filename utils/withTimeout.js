// utils/withTimeout.js
class TimeoutError extends Error {
  constructor(message = "Request timeout") {
    super(message);
    this.statusCode = 408;
  }
}

module.exports.withTimeout = (promise, ms = 5000) => {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError("Request took too long"));
    }, ms);
  });

  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    timeoutPromise
  ]);
};
