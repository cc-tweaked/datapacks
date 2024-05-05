import { createSignal, type Component, type JSX, For, createMemo, Show } from 'solid-js';

import styles from "./App.module.css";

import { Feature, type FeatureProps } from './components/Feature';
import { ToggleButton } from './components/Button';
import tools from './datapack/tools';
import { PackOutput, Version, versions, type PackItem } from './datapack';
import Download from './components/Download';


const Section: Component<{ title: string, children?: JSX.Element }> = props => <div class={styles.section}>
  <h2 class={styles.sectionTitle}>{props.title}</h2>
  {props.children}
</div>;

const FeatureSection: Component<{ title: string, features: FeatureProps[] }> = props =>
  <Show when={props.features.length > 0}>
    <Section title={props.title}>
      <div class={styles.featureContents}>
        <For each={props.features}>{feature => <Feature {...feature} />}</For>
      </div>
    </Section>
  </Show>;

const createPackItem = (x: PackItem) => {
  const [checked, setChecked] = createSignal(false);
  return { ...x, checked, setChecked }
}

const App: Component = () => {
  const [packName, setPackName] = createSignal("Customisations for CC: Tweaked");
  const [mcVersion, setMcVersion] = createSignal(Version.MC_1_20_1);

  const toolFeatures = tools.map(createPackItem);

  const allFeatures = [...toolFeatures];

  const createPack = createMemo(() => {
    const pack = new PackOutput(mcVersion());
    for (const feature of allFeatures) {
      if (feature.checked()) feature.process(pack);
    }
    return pack;
  });

  return <>
    <Section title="Pack Details">
      <div class={styles.inputGroup}>
        <label class={styles.label} for="packName">Pack Description</label>
        <input class={styles.input} id="packName" type="text" value={packName()} onInput={e => setPackName(e.currentTarget.value)} />

        <span class={styles.label} title="Which version of Minecraft to support">Minecraft Version</span>
        <div class={`${styles.input} ${styles.radioGroup}`}>
          <For each={versions}>{({ version, label }) => <span>
            <ToggleButton type="radio" name="mcVersion" classes={styles.radioButton} checked={mcVersion() == version} setChecked={() => setMcVersion(version)}>{label}</ToggleButton>
          </span>}</For>
        </div>
      </div>
    </Section>
    <FeatureSection title="Turtle Tools" features={toolFeatures} />
    <FeatureSection title="Tweaks" features={[]} />
    <Section title="Download">
      <Download name={packName()} pack={createPack()} />
    </Section>
  </>;
};

export default App;
