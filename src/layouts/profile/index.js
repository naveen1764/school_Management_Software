import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import React, { Fragment } from "react";
import { Badge, Card, CardBody, CardHeader, Col, Label, Row } from "reactstrap";
import { Accordion } from "react-bootstrap";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

const cardStyles = (color) => ({
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s, background-color 0.2s, color 0.2s",
  boxShadow: "0 0 1rem rgba(0, 0, 0, 0.2)",
  border: `2px solid ${color}`,
  backgroundColor: "white",
  color: color,
});

const onMouseOver = (e) => {
  e.currentTarget.style.transform = "scale(1.08)";
  e.currentTarget.style.backgroundColor = e.currentTarget.style.borderColor;
  e.currentTarget.style.color = "white";
  e.currentTarget.style.boxShadow = "0 0 1rem rgba(0, 0, 0, 0.5)";
};

const onMouseOut = (e) => {
  e.currentTarget.style.transform = "scale(1)";
  e.currentTarget.style.backgroundColor = "white";
  e.currentTarget.style.color = e.currentTarget.style.borderColor;
  e.currentTarget.style.boxShadow = "0 0 1rem rgba(0, 0, 0, 0.2)";
};

const linkStyles = {
  textDecoration: "none",
};

const linkMouseOver = (e) => {
  e.currentTarget.style.textDecoration = "underline";
};

const linkMouseOut = (e) => {
  e.currentTarget.style.textDecoration = "none";
};

function Overview() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Fragment>
        <Card>
          <CardHeader className="bg-secondary text-white">
            <b>Bodhi Campus, Ponneri - Academic Achievements</b>
          </CardHeader>
          <CardBody>
            <Accordion defaultActiveKey="">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <b>2023-2024</b>
                </Accordion.Header>
                <Accordion.Body>
                  <>
                    <Row className="text-center justify-content-center">
                      <Col xs={12} sm="6" md="3" lg="3" xl="3">
                        <Card
                          className="text-center h6 mb-1 mt-1"
                          style={cardStyles("#007bff")}
                          onMouseOver={onMouseOver}
                          onMouseOut={onMouseOut}
                        >
                          <CardBody>
                            <a
                              href="https://drive.google.com/file/d/1b8lboh27vIK7rD4HA7JaGGN--N-EXj4u/view?usp=drive_link"
                              className="h6"
                              style={linkStyles}
                              onMouseOver={linkMouseOver}
                              onMouseOut={linkMouseOut}
                              target="blank"
                            >
                              <b>NEET Results</b>
                            </a>
                          </CardBody>
                        </Card>
                      </Col>
                      <Col xs={12} sm="6" md="3" lg="3" xl="3">
                        <Card
                          className="text-center h6 mb-1 mt-1"
                          style={cardStyles("#dc3545")}
                          onMouseOver={onMouseOver}
                          onMouseOut={onMouseOut}
                        >
                          <CardBody>JEE-MAINS (P-1) Phase-2</CardBody>
                        </Card>
                      </Col>
                      <Col xs={12} sm="6" md="3" lg="3" xl="3">
                        <Card
                          className="text-center h6 mb-1 mt-1"
                          style={cardStyles("#ffc107")}
                          onMouseOver={onMouseOver}
                          onMouseOut={onMouseOut}
                        >
                          <CardBody>JEE-MAINS (P-1) Phase-1</CardBody>
                        </Card>
                      </Col>
                      <Col xs={12} sm="6" md="3" lg="3" xl="3">
                        <Card
                          className="text-center h6 mb-1 mt-1"
                          style={cardStyles("#17a2b8")}
                          onMouseOver={onMouseOver}
                          onMouseOut={onMouseOut}
                        >
                          <CardBody>JEE-Advanced</CardBody>
                        </Card>
                      </Col>
                      <Col xs={12} sm="6" md="3" lg="3" xl="3">
                        <Card
                          className="text-center h6 mb-1 mt-1"
                          style={cardStyles("#28a745")}
                          onMouseOver={onMouseOver}
                          onMouseOut={onMouseOut}
                        >
                          <CardBody>Medical Selections</CardBody>
                        </Card>
                      </Col>
                      <Col xs={12} sm="6" md="3" lg="3" xl="3">
                        <Card
                          className="text-center h6 mb-1 mt-1"
                          style={cardStyles("#343a40")}
                          onMouseOver={onMouseOver}
                          onMouseOut={onMouseOut}
                        >
                          <CardBody>
                            <a
                              href="https://drive.google.com/file/d/1Mt7rceysEk8xcw2alfU9mWDfXoUETapK/view?usp=sharing"
                              className="h6"
                              style={linkStyles}
                              onMouseOver={linkMouseOver}
                              onMouseOut={linkMouseOut}
                              target="blank"
                            >
                              <b>IIT/NIT/GFTIs Selections</b>
                            </a>
                          </CardBody>
                        </Card>
                      </Col>
                      <Col xs={12} sm="6" md="3" lg="3" xl="3">
                        <Card
                          className="text-center h6 mb-1 mt-1"
                          style={cardStyles("#007bff")}
                          onMouseOver={onMouseOver}
                          onMouseOut={onMouseOut}
                        >
                          <CardBody>XII - CBSE Board</CardBody>
                        </Card>
                      </Col>
                      <Col xs={12} sm="6" md="3" lg="3" xl="3">
                        <Card
                          className="text-center h6 mb-1 mt-1"
                          style={cardStyles("#dc3545")}
                          onMouseOver={onMouseOver}
                          onMouseOut={onMouseOut}
                        >
                          <CardBody>KVPY Selections</CardBody>
                        </Card>
                      </Col>
                      <Col xs={12} sm="6" md="3" lg="3" xl="3">
                        <Card
                          className="text-center h6 mb-1 mt-1"
                          style={cardStyles("#ffc107")}
                          onMouseOver={onMouseOver}
                          onMouseOut={onMouseOut}
                        >
                          <CardBody>NDA/NA Selections</CardBody>
                        </Card>
                      </Col>
                      <Col xs={12} sm="6" md="3" lg="3" xl="3">
                        <Card
                          className="text-center h6 mb-1 mt-1"
                          style={cardStyles("#17a2b8")}
                          onMouseOver={onMouseOver}
                          onMouseOut={onMouseOut}
                        >
                          <CardBody>JEE-MAINS (P-2) Phase-2</CardBody>
                        </Card>
                      </Col>
                      <Col xs={12} sm="6" md="3" lg="3" xl="3">
                        <Card
                          className="text-center h6 mb-1 mt-1"
                          style={cardStyles("#28a745")}
                          onMouseOver={onMouseOver}
                          onMouseOut={onMouseOut}
                        >
                          <CardBody>JEE-MAINS (P-2) Phase-1</CardBody>
                        </Card>
                      </Col>
                    </Row>
                  </>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>
                  <b>2022-2023</b>
                </Accordion.Header>
                <Accordion.Body>
                  <div>Work in Progress....</div>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>
                  <b>2021-2022</b>
                </Accordion.Header>
                <Accordion.Body>
                  <div>Work in Progress....</div>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="3">
                <Accordion.Header>
                  <b>2020-2021</b>
                </Accordion.Header>
                <Accordion.Body>
                  <div>Work in Progress....</div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </CardBody>
        </Card>
      </Fragment>
    </DashboardLayout>
  );
}

export default Overview;
