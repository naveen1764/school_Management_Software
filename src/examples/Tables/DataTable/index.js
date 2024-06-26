import { useState, useEffect, Fragment } from "react";
import {
  Card,
  CardBody,
  Table,
  Pagination,
  PaginationItem,
  PaginationLink,
  Input,
  Row,
  Col,
  Button,
} from "reactstrap";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ResultsTable = ({ marksData }) => {
  // Collect all unique dates to use as headers
  const allDates = [
    ...new Set(marksData.flatMap((item) => item.WeekendMarks.map((mark) => mark.Date))),
  ];

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [paginatedData, setPaginatedData] = useState([]);
  const [viewMode, setViewMode] = useState("totals"); // all, totals, averages

  // Compute averages and sort data
  const sortedMarksData = marksData
    .map((item) => ({
      ...item,
      averages: calculateAverages(item.WeekendMarks),
    }))
    .sort((a, b) => b.averages.Tot - a.averages.Tot);

  // Calculate the total number of pages
  const totalPages = Math.ceil(sortedMarksData.length / recordsPerPage);

  // Function to calculate averages
  function calculateAverages(marks) {
    const totals = { Mat: 0, Phy: 0, Che: 0, Tot: 0, count: 0 };

    marks.forEach((mark) => {
      totals.Mat += parseInt(mark.Mat, 10) || 0;
      totals.Phy += parseInt(mark.Phy, 10) || 0;
      totals.Che += parseInt(mark.Che, 10) || 0;
      totals.Tot += parseInt(mark.Tot, 10) || 0;
      totals.count += 1;
    });

    return {
      Mat: (totals.Mat / totals.count).toFixed(2),
      Phy: (totals.Phy / totals.count).toFixed(2),
      Che: (totals.Che / totals.count).toFixed(2),
      Tot: (totals.Tot / totals.count).toFixed(2),
    };
  }

  // Update paginated data when currentPage or recordsPerPage changes
  useEffect(() => {
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    setPaginatedData(sortedMarksData.slice(start, end));
  }, [currentPage, recordsPerPage, sortedMarksData]);

  // Handle page change
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Handle records per page change
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => setViewMode(mode);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [];

    // Headers row
    const headersRow = [
      "S.No",
      "Name of the Student",
      "RollNo",
      "Caste",
      ...allDates.flatMap((date) => {
        if (viewMode === "all") {
          return ["Mat", "Phy", "Che", "Tot"].map((subject) => `${date} - ${subject}`);
        } else if (viewMode === "totals") {
          return [`${date.slice(0, 5)} - Tot`];
        }
        return [];
      }),
      "Averages Mat",
      "Averages Phy",
      "Averages Che",
      "Averages Tot",
    ];
    wsData.push(headersRow);

    // Data rows
    paginatedData.forEach((item, index) => {
      const rowData = [
        index + 1 + (currentPage - 1) * recordsPerPage,
        item.StudentName,
        item.RollNo,
        item.Caste,
        ...allDates.flatMap((date) => {
          const marks = item.WeekendMarks.find((mark) => mark.Date === date) || {};
          if (viewMode === "all") {
            return [marks.Mat || "-", marks.Phy || "-", marks.Che || "-", marks.Tot || "-"];
          } else if (viewMode === "totals") {
            return [marks.Tot || "-"];
          }
          return [];
        }),
        item.averages.Mat,
        item.averages.Phy,
        item.averages.Che,
        item.averages.Tot,
      ];
      wsData.push(rowData);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "SortedData");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `XII_IIT_Super-60_Averages.xlsx`
    );
  };

  return (
    <Fragment>
      <div className="d-flex justify-content-between">
        <div>
          <Button
            color="primary"
            size="sm"
            style={{ marginRight: "25px", borderRadius: "5px" }}
            onClick={exportToExcel}
          >
            <span className="text-white">Export to Excel</span>
          </Button>
        </div>
        <div className="mb-1 justify-content-right">
          <Row>
            <Col>
              <Button
                color="warning"
                outline
                onClick={() => handleViewModeChange("totals")}
                style={{ marginRight: "5px", borderRadius: "20px" }}
                size="sm"
              >
                Only Totals
              </Button>
              <Button
                color="info"
                outline
                onClick={() => handleViewModeChange("all")}
                style={{ marginRight: "5px", borderRadius: "20px" }}
                size="sm"
              >
                All Subjects
              </Button>
              <Button
                color="success"
                outline
                onClick={() => handleViewModeChange("averages")}
                style={{ borderRadius: "20px" }}
                size="sm"
              >
                Only Averages
              </Button>
            </Col>
          </Row>
        </div>
      </div>
      <Card>
        <CardBody className="small">
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th rowSpan={2}>S.No</th>
                <th rowSpan={2}>Name of the Student</th>
                <th rowSpan={2}>Roll No</th>
                <th rowSpan={2}>Caste</th>
                {viewMode === "all" &&
                  allDates.map((date, index) => (
                    <th key={index} colSpan={4} className="text-danger">
                      {date}
                    </th>
                  ))}
                {viewMode === "totals" &&
                  allDates.map((date, index) => <th key={index}>{date.slice(0, 5)}</th>)}
                <th colSpan={4}>Averages</th>
              </tr>
              <tr>
                {viewMode === "all" &&
                  allDates.map((date, index) => (
                    <Fragment key={index}>
                      <th>Mat</th>
                      <th>Phy</th>
                      <th>Che</th>
                      <th>Tot</th>
                    </Fragment>
                  ))}
                {viewMode === "totals" && allDates.map((date, index) => <th key={index}>Tot</th>)}
                {(viewMode === "all" || viewMode === "totals" || viewMode === "averages") && (
                  <Fragment>
                    <th>Mat</th>
                    <th>Phy</th>
                    <th>Che</th>
                    <th>Tot</th>
                  </Fragment>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1 + (currentPage - 1) * recordsPerPage}</td>
                  <td>{item.StudentName}</td>
                  <td>{item.RollNo}</td>
                  <td>{item.Caste}</td>
                  {viewMode === "all" &&
                    allDates.map((date, dateIndex) => {
                      const marks = item.WeekendMarks.find((mark) => mark.Date === date) || {};
                      return (
                        <Fragment key={dateIndex}>
                          <td style={{ borderLeft: "2px solid black" }}>{marks.Mat || "-"}</td>
                          <td>{marks.Phy || "-"}</td>
                          <td>{marks.Che || "-"}</td>
                          <td style={{ borderRight: "2px solid black" }}>{marks.Tot || "-"}</td>
                        </Fragment>
                      );
                    })}
                  {viewMode === "totals" &&
                    allDates.map((date, dateIndex) => {
                      const marks = item.WeekendMarks.find((mark) => mark.Date === date) || {};
                      return <td key={dateIndex}>{marks.Tot || "-"}</td>;
                    })}
                  <td className="text-primary">
                    <b>{item.averages.Mat}</b>
                  </td>
                  <td className="text-primary">
                    <b>{item.averages.Phy}</b>
                  </td>
                  <td className="text-primary">
                    <b>{item.averages.Che}</b>
                  </td>
                  <td className="text-danger">
                    <b>{item.averages.Tot}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
      <Row className="mt-1 align-items-center">
        <Col className="align-left">
          <p>{`Showing ${paginatedData.length ? (currentPage - 1) * recordsPerPage + 1 : 0} to ${
            currentPage * recordsPerPage < sortedMarksData.length
              ? currentPage * recordsPerPage
              : sortedMarksData.length
          } of ${sortedMarksData.length} records`}</p>
        </Col>
        <Col className="text-right">
          <Input
            type="select"
            value={recordsPerPage}
            onChange={handleRecordsPerPageChange}
            style={{ display: "inline", width: "auto" }}
          >
            {[10, 25, 50, 100, 200, 500, 1000, 5000].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Input>
          <Pagination aria-label="Page navigation example" className="d-inline-block ml-3">
            <PaginationItem disabled={currentPage === 1}>
              <PaginationLink first onClick={() => handlePageChange(1)} />
            </PaginationItem>
            <PaginationItem disabled={currentPage === 1}>
              <PaginationLink previous onClick={() => handlePageChange(currentPage - 1)} />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem active={i + 1 === currentPage} key={i}>
                <PaginationLink onClick={() => handlePageChange(i + 1)}>{i + 1}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem disabled={currentPage === totalPages}>
              <PaginationLink next onClick={() => handlePageChange(currentPage + 1)} />
            </PaginationItem>
            <PaginationItem disabled={currentPage === totalPages}>
              <PaginationLink last onClick={() => handlePageChange(totalPages)} />
            </PaginationItem>
          </Pagination>
        </Col>
      </Row>
    </Fragment>
  );
};

ResultsTable.propTypes = {
  marksData: PropTypes.arrayOf(
    PropTypes.shape({
      StudentName: PropTypes.string.isRequired,
      RollNo: PropTypes.string.isRequired,
      Caste: PropTypes.string.isRequired,
      Gender: PropTypes.string.isRequired,
      Section: PropTypes.string.isRequired,
      WeekendMarks: PropTypes.arrayOf(
        PropTypes.shape({
          Date: PropTypes.string.isRequired,
          Mat: PropTypes.string,
          Phy: PropTypes.string,
          Che: PropTypes.string,
          Tot: PropTypes.string,
        })
      ).isRequired,
    })
  ).isRequired,
};

export default ResultsTable;
