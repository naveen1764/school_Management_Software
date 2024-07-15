// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

// Images
import { Fragment } from "react";
import { Card, CardBody } from "reactstrap";

function Overview() {
  return (
    <DashboardLayout>
      <Fragment>
        <Card>
          <CardBody>Ahivements Work in Progress.....</CardBody>
        </Card>
      </Fragment>
    </DashboardLayout>
  );
}

export default Overview;
