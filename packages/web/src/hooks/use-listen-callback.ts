import { useRef } from "react";

export type Callback = (...args: any[]) => void;

const noop = () => {};

const useListenCallback = (cb: Callback = noop) => {
  const callback = useRef<Callback>(cb);

  const listen = (fn: Callback) => {
    callback.current = fn;
  };

  return [listen, callback] as const;
};

export default useListenCallback;
