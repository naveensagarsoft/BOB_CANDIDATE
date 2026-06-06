import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { resetAllStates } from "../../store/index";

export default function Layout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const user = useSelector((state) => state.user.authUser?.access_token);
  const userData = useSelector((state) => state?.user?.user?.data);
  const user = userData?.accessToken;

  const handleLogout = () => {
    dispatch(resetAllStates());
    navigate("/login");
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="sm">
        <Container>
          <Navbar.Brand as={Link} to="/">Candidate Portal</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {!user && <Nav.Link as={Link} to="/login">Login</Nav.Link>}
            {!user && <Nav.Link as={Link} to="/register">Register</Nav.Link>}
            {user && <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>}
            {user && <Nav.Link onClick={handleLogout}>Logout</Nav.Link>}
          </Nav>
        </Container>
      </Navbar>

      <Container className="">
        <Outlet />
      </Container>
    </>
  );
}
