import { useState, useEffect, useMemo } from 'react'
import './App.css'
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import { AppFeatureItemMenuActionContext, BaseContext } from 'monday-sdk-js/types/client-context.type';
// import { Dropdown, Button } from "monday-ui-react-core";
import Dropdown from "monday-ui-react-core/dist/Dropdown.js";
import Button from "monday-ui-react-core/dist/Button.js";
import Flex from "monday-ui-react-core/dist/Flex.js";


//Explore more Monday React Components here: https://style.monday.com/
// import AttentionBox from "monday-ui-react-core/dist/AttentionBox";

// Usage of mondaySDK example, for more information visit here: https://developer.monday.com/apps/docs/introduction-to-the-sdk/
const monday = mondaySdk();

function App() {

  type boardType = {
    id: string,
    name: string,
    columns: {
      id: string,
      title: string
    }[]
  }

  type boardItemType = {
    name: string,
    column_values: {
      column: {
        id: string,
        title: string
      },
      text: string,
      value: string
    }[]
  }

  type navigationSettingsType = {
    accountId: string | null,
    boards: {
      boardId: string,
      boardName: string,
      navigationColumns: {
        columnIndex: number,
        columnId: string,
        columnLabel: string
      }[]
    }[]
  }

  const [context, setContext] = useState<AppFeatureItemMenuActionContext | BaseContext | null>(null); //context in monday this app launched for

  const [boards, setBoards] = useState<boardType[] | null>(null); //all boards of current account

  const [navigationSettings, setNavigationSettings] = useState<navigationSettingsType | null>({ accountId: null, boards: [] });

  // ---> board menu item

  const [boardItem, setBoardItem] = useState<boardItemType | null>(null); //current board item 

  const [navigationValue, setNavigationValue] = useState<string | null>(null); //navigation value

  // <--- board menu item

  const getCurrentBoardItem = async (boardItemContext: AppFeatureItemMenuActionContext) => {

    const query: string = `query {
      items (ids: ${boardItemContext.itemId}) {
        name
        column_values {
          column {
            id
            title
          }
          value
          text
        }
      }
    }`;

    const response = await monday.api(query);
    console.log(response);

    const item: boardItemType = response?.data?.items[0];
    setBoardItem(item);

    //TO DO: after retrieving curren board item, set its navigation values according to settings
    const oNavigationCol = item.column_values.find(obj => { return obj.column.title === "Notification Number" });
    const sNavigationValue = oNavigationCol?.text;
    setNavigationValue(sNavigationValue || null);

    return response;

  }

  const getBoards = async (boardItemContext) => {

    const query: string = `query {
      boards {
        id
        name
        columns {
          id
          title
        }
      }
    }`;

    // monday.setToken("eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjMyMjM1Mzg4NywiYWFpIjoxMSwidWlkIjo1NTU5ODYzNiwiaWFkIjoiMjAyNC0wMi0xN1QyMTo0MzozMC4xNjBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjExOTIxNzksInJnbiI6ImV1YzEifQ.eLZRL9X84fYlRYIT9J2ejADsAUUvG6Y1IGh_E7MIaRg");

    const response = await monday.api(query);
    console.log(response);

    const boards: boardType[] = response?.data?.boards;
    setBoards(boards);

    return response;

  }

  const navigationColumnChanged = (board: boardType, navColIndex: number, event) => {
    debugger
    let navSettings = navigationSettings;
    let boardSettings = navSettings?.boards.find(obj => { return obj.boardId === board.id });
    let oNavCol = {
      columnIndex: navColIndex,
      columnId: event.value,
      columnLabel: event.label
    };

    if (!boardSettings) {
      navSettings.boards.push({
        boardId: board.id,
        boardName: board.name,
        navigationColumns: [oNavCol]
      });
    } else {
      //TODO:
      // boardSettings.navigationColumns.find()
    }

    setNavigationSettings(navSettings);


  }

  const saveSettings = () => {

    monday.storage.setItem('navigationSettings', JSON.stringify(navigationSettings)).then(res => {
      console.log(res);
    });


  }


  useEffect(() => {
    // Notice this method notifies the monday platform that user gains a first value in an app.
    // Read more about it here: https://developer.monday.com/apps/docs/mondayexecute#value-created-for-user/
    monday.execute("valueCreatedForUser");

    monday.get("settings").then(res => {
      debugger

    });

    monday.storage.getItem('navigationSettings').then(res => {
      debugger
      if (res.data.value) {
        setNavigationSettings(JSON.parse(res.data.value));
      }
    });

    // TODO: set up event listeners, Here`s an example, read more here: https://developer.monday.com/apps/docs/mondaylisten/
    monday.listen("context", (res) => {
      debugger
      setContext(res.data);
      switch (res.data.appFeature.type) {
        case "AppFeatureAccountSettingsView":
          getBoards(res.data);
          break;

        case "AppFeatureItemMenuAction":
          getCurrentBoardItem(res.data);
          break;

        default:
          break;
      }

    });

  }, []);

  //Some example what you can do with context, read more here: https://developer.monday.com/apps/docs/mondayget#requesting-context-and-settings-data
  const attentionBoxText = `Hello man, your user_id is: ${context ? context.user.id : "still loading"
    }.
  Amazing app, which will change the world!!!`;

  return (
    <div className="App">
      {/* navigation settings */}
      {boards &&
        <div>
          Choose navigation column for your boards:
          {boards.map((board, i) => {
            // let options = useMemo(() => [board.columns.map(obj => { return { value: obj.id, label: obj.title } })], []);
            let options = board.columns.map(obj => { return { value: obj.id, label: obj.title } });
            return (
              <div>
                <span>
                  {board.name}
                </span>
                <span>

                  <Dropdown placeholder="select navigation column 1" options={options} onChange={(event) => {
                    console.log(board)
                    navigationColumnChanged(board, 1, event);
                  }} />
                  <Dropdown placeholder="select navigation column 2" options={options} onChange={(event) => {
                    console.log(board)
                    navigationColumnChanged(board, 2, event);

                  }} />

                </span>
                <div>
                </div>
              </div>
            )
          })}
          <Button onClick={saveSettings}>
            SAVE
          </Button>
        </div>
      }

      {/* navigation settings */}
      {boardItem &&
        <button onClick={() => {
          alert(`ok navigating to ${navigationValue}`);
        }}>
          navigate to {navigationValue}
        </button>
      }

      {/* <div>
        {attentionBoxText} {boardItem?.name}
      </div>

      <button onClick={() => {
        console.log(context);

      }}>
        console log context
      </button> */}



    </div>

  );


  //  const [count, setCount] = useState(0)

  //   return (
  //     <>
  //       <div>
  //         <a href="https://vitejs.dev" target="_blank">
  //           <img src={viteLogo} className="logo" alt="Vite logo" />
  //         </a>
  //         <a href="https://react.dev" target="_blank">
  //           <img src={reactLogo} className="logo react" alt="React logo" />
  //         </a>
  //       </div>
  //       <h1>Vite + React</h1>
  //       <div className="card">
  //         <button onClick={() => setCount((count) => count + 1)}>
  //           count is {count}
  //         </button>
  //         <p>
  //           Edit <code>src/App.tsx</code> and save to test HMR
  //         </p>
  //       </div>
  //       <p className="read-the-docs">
  //         Click on the Vite and React logos to learn more
  //       </p>
  //     </>
  //   )
}

export default App
