import type { Component } from "solid-js";
import type { PackOutput } from "../datapack";
import { saveBlob } from "../utils";

import styles from "./Download.module.css";
import { Button } from "./Button";

const Download: Component<{ name: string, pack: PackOutput }> = props => {
  const packFileName = () => `${props.name.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase()}`

  const createDatapack = () => {
    props.pack.makeDataPack(props.name).generateAsync({ type: "blob" })
      .then(x => saveBlob(`${packFileName()}.zip`, x))
      .catch(e => console.error(e));
  };

  const createMod = () => {
    props.pack.makeMod(props.name).generateAsync({ type: "blob" })
      .then(x => saveBlob(`${packFileName()}.jar`, x))
      .catch(e => console.error(e));
  };

  return <div class={styles.downloadSplit}>
    <div class={styles.downloadSummary}>
      <h3>Download as Data Pack</h3>
      <p>
        Download as a data pack. This file should be saved to <code>datapacks/{packFileName()}.zip</code> in your world
        folder.
      </p>
    </div>
    <div class={styles.downloadButtons}>
      <Button class={styles.downloadButton} type="button" onClick={() => createDatapack()} disabled={!props.pack.hasData()}>
        Download <code>{packFileName()}.zip</code>
      </Button>
    </div>
    <div class={styles.downloadSeparator}>
      <div class={styles.downloadBar} />
      <div>or</div>
      <div class={styles.downloadBar} />
    </div>
    <div class={styles.downloadSummary}>
      <h3>Download as Mod</h3>
      <p>
        Download as a mod. This file should be saved to <code>mods/{packFileName()}.zip</code> in your Minecraft folder.
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
