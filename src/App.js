import React from "react";
import "./App.css";

const DIST_MULTIPLIERS = {
  5: 0.476319876,
  10: 1,
  half: 2.222729,
  full: 4.666666667,
};
const DIST_LABELS = {
  5: "5k",
  10: "10k",
  half: "Half Marathon",
  full: "Marathon",
};

function toString(secs) {
  const date = new Date(null);
  date.setSeconds(secs);
  return date.toISOString().substr(11, 8);
}

function fromString(str) {
  let value = str.replace(/:/g, "");
  value = value.replace(/_/g, "");
  if (value.length < 6) {
    throw new Error("Invalid date form");
  }
  const h = value.substr(0, 2);
  const m = value.substr(2, 2);
  const s = value.substr(4, 2);
  return parseInt(h * 3600) + parseInt(m * 60) + parseInt(s);
}

const RUNNERS = [
  {
    name: "Jules",
    times: ["00:46:06"],
  },
  {
    name: "Matt",
    times: ["00:33:41"],
  },
  {
    name: "James",
    times: ["00:49:48"],
  },
  {
    name: "Tom",
    times: ["00:49:48"],
  },
];
const PHASES = [10];
const NEXT_PHASE_DIST = 5;

const SimpleTable = ({ columns, data }) => {
  const dataColumns = columns;
  const dataRows = data;

  const tableHeaders = (
    <thead>
      <tr>
        {dataColumns.map(function (column) {
          return <th>{column}</th>;
        })}
      </tr>
    </thead>
  );

  const tableBody = dataRows.map(function (row) {
    return (
      <tr>
        {dataColumns.map(function (column) {
          return <td>{row[column]}</td>;
        })}
      </tr>
    );
  });

  // Decorate with Bootstrap CSS
  return (
    <table className="table table-bordered table-hover" width="100%">
      {tableHeaders}
      {tableBody}
    </table>
  );
};

function App() {
  const phases = PHASES.map((dist, i) => {
    const label = DIST_LABELS[dist];

    const fastestTime = RUNNERS.map((t) => fromString(t.times[i])).reduce(
      (a, b) => Math.min(a, b),
      Infinity
    );

    const runnersData = RUNNERS.map(({ name, times }) => ({
      name,
      time: times[i],
      winner: fastestTime === fromString(times[i]),
    }));

    return (
      <div>
        <h4>
          Run {i + 1} \\ {label} \\ Winner{" "}
          {runnersData.find((d) => d.winner).name}
        </h4>
        <SimpleTable columns={["name", "time"]} data={runnersData} />
      </div>
    );
  });

  const nextPhaseRaw = RUNNERS.map(({ name, times }) => {
    const lastTime = fromString(times[times.length - 1]);
    const lastDistance = PHASES[PHASES.length - 1];
    const target =
      (lastTime / DIST_MULTIPLIERS[lastDistance]) *
      DIST_MULTIPLIERS[NEXT_PHASE_DIST];

    return { name, target };
  });

  const fastestTime = nextPhaseRaw
    .map((p) => p.target)
    .reduce((a, b) => Math.min(a, b), Infinity);
  const nextPhase = nextPhaseRaw.map(({ name, target }) => {
    const handicap = toString(target - fastestTime);
    return { name, handicap, target: toString(target) };
  });

  return (
    <div className="App" style={{ textAlign: "center", maxWidth: "800px" }}>
      <h1>COVID CUP POWER RANKINGS</h1>

      <div className="next">
        <h3>CURRENT ROUND - {DIST_LABELS[NEXT_PHASE_DIST]} - Ends 15 June</h3>
        <SimpleTable
          columns={["name", "target", "handicap"]}
          data={nextPhase}
        />
      </div>

      <div className="past">
        <h3>COMPLETED ROUNDS</h3>
        {phases}
      </div>

      <footer>
        Methodology and multipliers adapted from{" "}
        <a href="https://www.selbystriders.org.uk/handicap-competitions/handicap-points-calculator/">
          Selby Striders
        </a>
      </footer>
    </div>
  );
}

export default App;
