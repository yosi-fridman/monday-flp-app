import { useState, useEffect } from 'react'
import './App.css'
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import { AppFeatureItemMenuActionContext, BaseContext } from 'monday-sdk-js/types/client-context.type';

//Explore more Monday React Components here: https://style.monday.com/
// import AttentionBox from "monday-ui-react-core/dist/AttentionBox.js";

// Usage of mondaySDK example, for more information visit here: https://developer.monday.com/apps/docs/introduction-to-the-sdk/
const monday = mondaySdk();

function App() {

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

  const [context, setContext] = useState<AppFeatureItemMenuActionContext | BaseContext | null>(null);

  const [boardItem, setBoardItem] = useState<boardItemType | null>(null);

  const [navigationValue, setNavigationValue] = useState<string | null>(null);


  const getBoardItem = async (boardItemContext: AppFeatureItemMenuActionContext) => {
    debugger
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

    const item: boardItemType = response?.data?.items[0]

    const oNavigationCol = item.column_values.find(obj => { return obj.column.title === "Notification Number" });
    const sNavigationValue = oNavigationCol?.text;

    setBoardItem(item);
    setNavigationValue(sNavigationValue || null);

    return response;

  }

  useEffect(() => {
    // Notice this method notifies the monday platform that user gains a first value in an app.
    // Read more about it here: https://developer.monday.com/apps/docs/mondayexecute#value-created-for-user/
    monday.execute("valueCreatedForUser");

    // TODO: set up event listeners, Here`s an example, read more here: https://developer.monday.com/apps/docs/mondaylisten/
    monday.listen("context", (res) => {
      setContext(res.data);
      getBoardItem(res.data);
    });
  }, []);

  //Some example what you can do with context, read more here: https://developer.monday.com/apps/docs/mondayget#requesting-context-and-settings-data
  const attentionBoxText = `Hello man, your user_id is: ${context ? context.user.id : "still loading"
    }.
  Let's start building your amazing app, which will change the world!!!`;


  return (
    <div className="App">
      <div>
        {attentionBoxText} {boardItem?.name}
      </div>

      <button onClick={() => {
        console.log(context);

      }}>
        console log context
      </button>

      <button onClick={() => {
        alert(`ok navigating to ${navigationValue}`);
      }}>
        navigate to {navigationValue}
      </button>

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
