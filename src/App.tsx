import { For, Show, createMemo, createSignal, type Accessor, type Component, type JSX } from 'solid-js';

import styles from "./App.module.css";

import { ToggleButton } from './components/Button';
import Download from './components/Download';
import { Feature, type FeatureProps } from './components/Feature';
import { PackOutput, Version, makeModId, versions, type PackItem } from './datapack';
import { turtleFlags } from './datapack/overlay';
import tools from './datapack/tools';


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

const createPackItem = (x: PackItem): FeatureProps => {
  const [checked, setChecked] = createSignal(false);
  return { ...x, checked, setChecked }
}

const createPackItems = (x: PackItem[], version: Accessor<Version>): Accessor<FeatureProps[]> => {
  const allTweaks = x.map(createPackItem);
  return createMemo(() => allTweaks.filter(x => !x.enabled || x.enabled(version())));
}

const App: Component = () => {
  const [packName, setPackName] = createSignal("Customisations for CC: Tweaked");
  const [packId, setPackId] = createSignal("");
  const [mcVersion, setMcVersion] = createSignal(Version.MC_1_20_1);

  const enabledTools = createPackItems(tools, mcVersion);
  const enabledTweaks = createPackItems([turtleFlags], mcVersion);
  const allFeatures = () => [...enabledTools(), ...enabledTweaks()];

  const createPack = createMemo(() => {
    const id = packId();
    const pack = new PackOutput(mcVersion(), packName(), id === "" ? undefined : id);
    for (const feature of allFeatures()) {
      if (feature.checked()) feature.process(pack);
    }
    return pack;
  });

  return <>
    <Section title="Pack Details">
      <div class={styles.inputGroup}>
        <label class={styles.label} for="packName">Pack Description</label>
        <input
          class={styles.input} id="packName" type="text"
          title="The name of the pack, as displayed in Minecraft."
          value={packName()} onInput={e => setPackName(e.currentTarget.value)}
        />

        <label class={styles.label} for="packId">Pack Namespace</label>
        <input
          class={styles.input} id="packId" type="text"
          pattern="[a-z][a-z0-9_]{3,63}" placeholder={makeModId(packName())}
          title="The mod namespace used for resources. Should be a string containing just lowercase letters and underscores."
          value={packId()} onInput={e => setPackId(e.currentTarget.value)}
        />

        <span class={styles.label} title="Which version of Minecraft to support">Minecraft Version</span>
        <div class={`${styles.input} ${styles.radioGroup}`}>
          <For each={versions}>{({ version, label }) => <span>
            <ToggleButton type="radio" name="mcVersion" classes={styles.radioButton} checked={mcVersion() == version} setChecked={() => setMcVersion(version)}>{label}</ToggleButton>
          </span>}</For>
        </div>
      </div>
    </Section>
    <FeatureSection title="Turtle Tools" features={enabledTools()} />
    <FeatureSection title="Tweaks" features={enabledTweaks()} />
    <Section title="Download">
      <Download pack={createPack()} />
    </Section>
  </>;
};

export default App;
