import { Match, Show, Switch, type Component } from "solid-js";
import type { PackOutput } from "../datapack";
import { saveBlob } from "../utils";

import styles from "./Download.module.css";
import { Button } from "./Button";

const Download: Component<{ pack: PackOutput }> = props => {
  const packFileName = () => `${props.pack.name.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase()}`

  const createDatapack = () => {
    props.pack.makeDataPack().generateAsync({ type: "blob" })
      .then(x => saveBlob(`${packFileName()}.zip`, x))
      .catch(e => console.error(e));
  };

  const createResourcepack = () => {
    props.pack.makeResourcePack().generateAsync({ type: "blob" })
      .then(x => saveBlob(`${packFileName()}-resources.zip`, x))
      .catch(e => console.error(e));
  };

  const createMod = () => {
    props.pack.makeMod().generateAsync({ type: "blob" })
      .then(x => saveBlob(`${packFileName()}.jar`, x))
      .catch(e => console.error(e));
  };

  return <div class={styles.downloadSplit}>
    <div class={styles.downloadSummary}>
      <Switch>
        <Match when={props.pack.hasResources()}>
          <h3>Download as resource and datapack</h3>
          <p>
            Download a separate resource and datapack. The datapack should be saved to <code>datapacks/{packFileName()}.zip</code> in
            your world folder, and the resource pack to the global <code>resourcepacks</code> folder.
          </p>
        </Match>
        <Match when={true}>
          <h3>Download as datapack</h3>
          <p>
            Download as a datapack. This file should be saved to <code>datapacks/{packFileName()}.zip</code> in your world
            folder.
          </p>
        </Match>
      </Switch>
    </div>
    <div class={styles.downloadButtons}>
      <Button class={styles.downloadButton} type="button" onClick={() => createDatapack()} disabled={!props.pack.hasData()}>
        Download <code>{packFileName()}.zip</code>
      </Button>
      <Show when={props.pack.hasResources()}>
        <div class={styles.downloadSeparatorHorizontal}>
          <div class={styles.downloadBar} />
          <p>and</p>
          <div class={styles.downloadBar} />
        </div>
        <Button class={styles.downloadButton} type="button" onClick={() => createResourcepack()} disabled={!props.pack.hasResources()}>
          Download <code>{packFileName()}-resources.zip</code>
        </Button>
      </Show>
    </div>
    <div class={styles.downloadSeparator}>
      <div class={styles.downloadBar} />
      <div>or</div>
      <div class={styles.downloadBar} />
    </div>
    <div class={styles.downloadSummary}>
      <h3>Download as mod</h3>
      <p>
        Download as a mod. This file should be saved to <code>mods/{packFileName()}.jar</code> in your Minecraft folder.
      </p>
    </div>
    <div class={styles.downloadButtons}>
      <Button class={styles.downloadButton} type="button" onClick={() => createMod()} disabled={!props.pack.hasData() && !props.pack.hasResources()}>
        Download <code>{packFileName()}.jar</code>
      </Button>
    </div>
  </div>;
};

export default Download;
