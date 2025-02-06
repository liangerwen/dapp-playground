import { RefAttributes } from "react";

declare module "react-json-view" {
  interface ReactJsonViewProps extends RefAttributes<any>, ReactJsonViewProps {}
}
