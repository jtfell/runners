import React from "react";
import { CrownIcon, StopwatchIcon, Pane, Table, Heading, Avatar, Badge } from 'evergreen-ui'
import "./App.css";

const DIST_MULTIPLIERS = {
  5: 0.476319876,
  8: 0.78,
  10: 1,
  15: 1.65,
  half: 2.222729,
  full: 4.666666667,
};
const DIST_LABELS = {
  5: "5k",
  8: "8k",
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
    initials: 'J F',
    times: ["00:37:14"],
  },
  {
    name: "Tom",
    initials: 'T P',
    times: ["00:34:44"],
  },
  {
    name: "James",
    initials: 'J G',
    times: ["00:44:06"],
  },
  {
    name: "Nathan",
    initials: "N J",
    times: ["00:44:06"],
  },
];
const PHASES = [8];
const NEXT_PHASE_DIST = 10;

const toCapCase = (name) => name[0].toUpperCase() + name.substring(1);

const SimpleTable = ({ columns, data }) => {

  const tableHeaders = (
    <Table.Head>
      {columns.map(function (column) {
        return <Table.HeaderCell>{toCapCase(column)}</Table.HeaderCell>;
      })}
    </Table.Head>
  );

  const tableRows = data.map(function (row, j) {
    return (
      <Table.Row key={j}>
        {columns.map(function (column, i) {
          return <Table.Cell key={i}>{row[column]}</Table.Cell>;
        })}
      </Table.Row>
    );
  });

  return (
    <Table border>
      {tableHeaders}
      <Table.Body>
        {tableRows}
      </Table.Body>
    </Table>
  );
};

function App() {
  const phases = PHASES.map((dist, i) => {
    const label = DIST_LABELS[dist];

    const lastDistance = PHASES[i - 1];
    const runnersData = RUNNERS.map(({ name, times, initials }) => {
      const lastTime = fromString(times[i - 1] || '00:00:00');
      const target =
        (lastTime / DIST_MULTIPLIERS[lastDistance]) *
        DIST_MULTIPLIERS[PHASES[i]];
      const diff = `${Math.round(fromString(times[i]) - target)}s`;

      return {
        name: <div><Avatar name={initials} size={25} marginRight={10} />{name}</div>,
        initials,
        time: times[i],
        target: lastDistance ? toString(target) : '-',
        diff: lastDistance ? diff : '-',
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

    const winnerEntry = runnersData.find(r => r.name === winner.name);
    winnerEntry.name = <>{winnerEntry.name} <CrownIcon marginLeft={5} size={20} /></>;

    return (
      <Pane background="blueTint" elevation={1} width={600} alignItems="center" padding={18}>
        <Badge color="neutral" marginBottom={30}>{label}</Badge>
        <SimpleTable columns={["name", "time", "diff"]} data={runnersData} />
      </Pane>
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
    <Pane display="flex" padding={16} borderRadius={3} maxWidth={1024} margin="auto" alignItems="center" flexDirection="column">
      <Heading size={900} marginTop="default">COVID Cup 2021</Heading>

      <Pane elevation={1} marginTop={30} background="tint2" width={600} alignItems="left" padding={18}>
        <Badge color="neutral" marginRight={30}>{DIST_LABELS[NEXT_PHASE_DIST]}</Badge>
        <Heading size={300} margin={10}>
          <StopwatchIcon size={20} marginRight={5}/> March 1 - March 31
        </Heading>
        <SimpleTable
          columns={["name", "target", "handicap"]}
          data={nextPhase}
        />
      </Pane>

      <Heading size={700} margin={30}>Completed</Heading>
      <Pane alignItems="center">
        {phases.reverse()}
      </Pane>
    </Pane>
  );
}

export default App;
