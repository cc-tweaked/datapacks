import { createSignal, type Accessor, type Component, type Setter } from 'solid-js';

import styles from "./Feature.module.css";
import { ToggleButton } from './Button';
import type { PackItem } from '../datapack';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';


export type FeatureProps = PackItem & {
  checked: Accessor<boolean>,
  setChecked: Setter<boolean>;
};

export const Feature: Component<FeatureProps> = props => {
  let tooltip: HTMLDivElement;
  let button: HTMLLabelElement;

  // TODO: Move the tooltip code into a more reusable component.
  const [tooltipVisible, setTooltipVisible] = createSignal(false);

  const showTooltip = () => {
    setTooltipVisible(true);

    void computePosition(button, tooltip, {
      placement: "top",
      middleware: [offset(4), flip(), shift()],
    }).then(({ x, y }) => {
      Object.assign(tooltip.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  };

  const hideToolip = () => setTooltipVisible(false);

  return <div class={styles.feature}>
    <div ref={tooltip} class={styles.tooltip} style={{ display: tooltipVisible() ? "block" : "none" }}>{props.description}</div>
    <ToggleButton
      type="checkbox"
      ref={button}
      classes={styles.featureLabel}
      checked={props.checked()} setChecked={props.setChecked}
      onMouseEnter={showTooltip} onFocus={showTooltip}
      onMouseLeave={hideToolip} onBlur={hideToolip}
    >
      <img class={styles.featureImg} width={160} height={160} src={props.icon} alt={props.iconAlt} />
      <span>{props.name}</span>
    </ToggleButton>
  </div>
};
