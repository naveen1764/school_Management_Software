// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

// Images
import { Fragment } from "react";
import { Card, CardBody } from "reactstrap";

const ImportantDates = () => {
  return (
    <DashboardLayout>
      <Fragment>
        <Card>
          <CardBody>
            <iframe
              src="https://docs.google.com/document/d/1wxvPg0xIrzvXyYsGpm7sh-OurJXW5CRiWKTJFYLNbxA/preview?usp=sharing"
              width="1165"
              height="850"
              allow="autoplay"
            ></iframe>
          </CardBody>
        </Card>
      </Fragment>
    </DashboardLayout>
  );
};

export default ImportantDates;
