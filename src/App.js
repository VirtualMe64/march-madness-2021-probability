import { useState, useEffect } from 'react'
import './App.css';

function App() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState({});
  
  // Note: the empty deps array [] means
  // this useEffect will run once
  // similar to componentDidMount()
  useEffect(() => {
    console.log("api call made")
    fetch("https://projects.fivethirtyeight.com/march-madness-api/2021/latest.json")
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setItems(result);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, [])

  const win_probs = () => {
    let out = []
    const gonzagaOverall = items.forecasts.mens.teams.filter((x) => x.team_name === "Gonzaga")[0].rd7_win
    const uclaOverall = items.forecasts.mens.teams.filter((x) => x.team_name === "UCLA")[0].rd7_win
    const baylorOverall = items.forecasts.mens.teams.filter((x) => x.team_name === "Baylor")[0].rd7_win
    const houstonOverall = items.forecasts.mens.teams.filter((x) => x.team_name === "Houston")[0].rd7_win
    const scOverall = items.forecasts.womens.teams.filter((x) => x.team_name === "South Carolina")[0].rd7_win
    const arizonaBeatsUConn = items.games.womens.filter((x) => x.team1 === "Arizona" && x.round === 5)[0]
    const arizonaBeatsUConnChance = arizonaBeatsUConn.live_prob !== null ? arizonaBeatsUConn.live_prob : arizonaBeatsUConn.pregame_prob
    const stanfordBeatsSouthCarolina = items.games.womens.filter((x) => x.team1 === "South Carolina" && x.round === 5)[0]
    const stanfordBeatsSouthCarolinaChance = stanfordBeatsSouthCarolina.live_prob !== null ? stanfordBeatsSouthCarolina.live_prob : stanfordBeatsSouthCarolina.pregame_prob

    out.push({name: "Besser", prob: uclaOverall * scOverall * arizonaBeatsUConnChance})
    out.push({name: "Dave", prob: gonzagaOverall + (uclaOverall * (1 - stanfordBeatsSouthCarolinaChance)) - out[0].prob})
    out.push({name: "Sammy", prob: baylorOverall + (uclaOverall * stanfordBeatsSouthCarolinaChance)})
    out.push({name: "Andy", prob: houstonOverall})

    return out
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded || Object.keys(items).length === 0) {
    return <div>Loading...</div>;
  } else {
    const result = win_probs().sort((a, b) => b.prob - a.prob)
    return (
      <div>
        {result.map(
          (x) => <h1>{x.name}: {(x.prob * 100).toFixed(2)}%</h1>
        )}
      </div>
    );
  }
}

export default App;