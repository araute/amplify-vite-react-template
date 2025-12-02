import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { Container, Navbar, Nav } from "react-bootstrap";
import { Link, Route, Routes } from "react-router-dom";
import StoreProductsPage from "./StoreProducts.tsx";

const client = generateClient<Schema>();

function deleteTodo(id: string) {
  client.models.Todo.delete({ id });
}
const App = () => {
  const { user, signOut } = useAuthenticator();
  const [products, setProducts] = useState<Array<Schema["Product"]["type"]>>(
    [],
  );

  // useEffect(() => {
  //   client.models.Todo.observeQuery().subscribe({
  //     next: (data) => setTodos([...data.items]),
  //   });
  // }, []);

  // useEffect(() => {
  //   client.models.Product.observeQuery().subscribe({
  //     next: (data) => setProducts([...data.items]),
  //   });
  //   console.log(products);
  // }, []);

  function createTodo() {
    console.log(user);
  }
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">STORE A</Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navbar-nav" />
          <Navbar.Collapse id="main-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Orders</Nav.Link>
              <Nav.Link as={Link} to="/store-products">
                Store Products
              </Nav.Link>
              <Nav.Link href="#pricing">Pending</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container style={{ marginTop: "2rem" }}>
        <Routes>
          <Route path="/orders" element={<div>Orders Page</div>} />
          <Route path="/store-products" element={<StoreProductsPage />} />
          <Route path="/pending" element={<div>Pending Page</div>} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </Container>
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
    </>
  );
};

export default App;
