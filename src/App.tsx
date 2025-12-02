import { useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Container, Navbar, Nav } from "react-bootstrap";
import { Link, Route, Routes } from "react-router-dom";
import StoreProductsPage from "./StoreProducts.tsx";
import StoreOrders from "./StoreOrders.tsx";

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
              <Nav.Link as={Link} to="/store-orders">
                Orders
              </Nav.Link>
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
          <Route path="/store-orders" element={<StoreOrders />} />
          <Route path="/store-products" element={<StoreProductsPage />} />
          <Route path="/pending" element={<div>Pending Page</div>} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </Container>
      <main>
        <h1>{user?.signInDetails?.loginId}'s todos</h1>
        <button onClick={signOut}>Sign out</button>
      </main>
    </>
  );
};

export default App;
