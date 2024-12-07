import useListenCallback, { Callback } from "@/hooks/use-listen-callback";

const useListenStatus = ({
  initialSuccessCallback,
  initialErrorCallback,
}: {
  initialSuccessCallback?: Callback;
  initialErrorCallback?: Callback;
} = {}) => {
  const [onSuccess, successCallbackRef] = useListenCallback(
    initialSuccessCallback
  );
  const [onError, errorCallbackRef] = useListenCallback(initialErrorCallback);

  const wrap = async <T>(promise: Promise<T>) =>
    promise
      .then((res) => {
        successCallbackRef.current(res);
        return res;
      })
      .catch((err) => {
        console.log(Object.entries(err), "pxl");
        errorCallbackRef.current(err);
        throw err;
      });

  return [wrap, { onSuccess, onError }] as const;
};

export default useListenStatus;
