import React from "react";
import "./App.css";

const DIST_MULTIPLIERS = {
  5: 0.476319876,
  10: 1,
  15: 1.65,
  half: 2.222729,
  full: 4.666666667,
};
const DIST_LABELS = {
  5: "5k",
  10: "10k",
  15: "15k",
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
    times: ["00:46:06", "00:21:20"],
  },
  {
    name: "Matt",
    times: ["00:33:41", "00:16:14"],
  },
  {
    name: "James",
    times: ["00:49:48", "00:22:05"],
  },
  {
    name: "Tom",
    times: ["00:44:06", "00:20:55"],
  },
];
const PHASES = [10, 5];
const NEXT_PHASE_DIST = 15;

const SimpleTable = ({ columns, data }) => {
  const dataColumns = columns;
  const dataRows = data;

  const pc = 100 / columns.length;

  const tableHeaders = (
    <thead>
      <tr>
        {dataColumns.map(function (column) {
          return <th width={`${pc}%`}>{column}</th>;
        })}
      </tr>
    </thead>
  );

  const tableBody = dataRows.map(function (row) {
    return (
      <tr>
        {dataColumns.map(function (column) {
          return <td width={`${pc}%`}>{row[column]}</td>;
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

    const lastDistance = PHASES[i - 1];
    const runnersData = RUNNERS.map(({ name, times }) => {
      const lastTime = fromString(times[i - 1] || '00:00:00');
      const target =
        (lastTime / DIST_MULTIPLIERS[lastDistance]) *
        DIST_MULTIPLIERS[PHASES[i]];
      const diff = `${Math.round(fromString(times[i]) - target)}s`;

      return {
        name,
        time: times[i],
        target: lastDistance ? toString(target) : 'NA',
        diff: lastDistance ? diff : 'NA',
      };
    });

    const winner = runnersData.reduce(
      (a, b) => {
        if (!a) {
          return b;
        }
        if (!b) {
          return a;
        }
        if (!lastDistance) {
          if (fromString(a.time) < fromString(b.time)) {
            return a;
          }
          return b;
        }
        if (parseInt(a.diff) < parseInt(b.diff)) {
          return a;
        }
        return b;
      },
      null
    );

    return (
      <div>
        <h4>
          {label} \\ Winner: {winner.name}
        </h4>
        <SimpleTable columns={["name", "time", "diff"]} data={runnersData} />
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
        <h3>CURRENT ROUND - {DIST_LABELS[NEXT_PHASE_DIST]} - Ends 15 July</h3>
        <SimpleTable
          columns={["name", "target", "handicap"]}
          data={nextPhase}
        />
      </div>

      <div className="past">
        <h3>COMPLETED ROUNDS</h3>
        {phases.reverse()}
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
