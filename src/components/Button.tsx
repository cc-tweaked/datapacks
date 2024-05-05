import { createUniqueId, splitProps, type Component, type JSX } from "solid-js";
import styles from "./Button.module.css";
import { classNames } from "../utils";

type Props = {
  type: "checkbox" | "radio",
  name?: string,
  checked: boolean,
  setChecked: (value: boolean) => void,
  classes?: string,
  children: JSX.Element,
} & JSX.HTMLElementTags["label"];

export const ToggleButton: Component<Props> = allProps => {
  const id = createUniqueId();
  const [props, buttonProps] = splitProps(allProps, ["type", "name", "checked", "setChecked", "classes", "children"]);

  return <>
    <input
      class={styles.input}
      type={props.type}
      name={props.name}
      id={id}
      checked={props.checked}
      onChange={e => props.setChecked(e.currentTarget.checked)}
    />
    <label
      {...buttonProps}
      class={classNames(styles.buttonLike, props.classes)}
      for={id}
    >{props.children}</label>
  </>
}

export const Button: Component<JSX.IntrinsicElements["button"]> = props =>
  <button {...props} class={classNames(styles.buttonLike, styles.button, props.class)}>
    {props.children}
  </button>;
