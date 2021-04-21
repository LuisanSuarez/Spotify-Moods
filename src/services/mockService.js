export default function mockService() {
  const wait = async time => {
    for (let i = 0; i < time * 1000000; i++) {
      i++;
      i--;
    }
    return "waited", time;
  };

  return {
    wait,
  };
}
