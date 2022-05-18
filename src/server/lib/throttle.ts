import pThrottle from 'p-throttle';

const throttle = pThrottle({
  limit: 20,
  interval: 1000,
});

export default throttle;
