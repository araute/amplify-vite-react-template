import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function deleteTodo(id: string) {
  client.models.Todo.delete({ id });
}
function App() {
  const { user, signOut } = useAuthenticator();
  const [products, setProducts] = useState<Array<Schema["Product"]["type"]>>(
    [],
  );

  // useEffect(() => {
  //   client.models.Todo.observeQuery().subscribe({
  //     next: (data) => setTodos([...data.items]),
  //   });
  // }, []);

  useEffect(() => {
    client.models.Product.observeQuery().subscribe({
      next: (data) => setProducts([...data.items]),
    });
    console.log(products);
  }, []);

  function createTodo() {
    console.log(user);
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {products.map((product) => (
          <li onClick={() => deleteTodo(product.id)} key={product.id}>
            {product.name}
          </li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
