import { useState, useEffect, Fragment, useMemo, useRef } from "react";
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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  CloseButton,
} from "reactstrap";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Print } from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import { Printer, User, X } from "react-feather";

const ResultsTable = ({ marksData, stuData }) => {
  // Collect all unique dates to use as headers
  const allDates = [
    ...new Set(marksData.flatMap((item) => item.WeekendMarks.map((mark) => mark.Date))),
  ];

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [paginatedData, setPaginatedData] = useState([]);
  const [viewMode, setViewMode] = useState("totals"); // all, totals, averages
  const [selectedCampus, setSelectedCampus] = useState("All_Campuses");
  const [selectedMentor, setSelectedMentor] = useState("All_Mentors");
  const campuses = ["All_Campuses", ...new Set(marksData.map((item) => item.Campus))];
  const [selectedSubject, setSelectedSubject] = useState("All_Subjects");
  const subjects = ["All_Subjects", "Mat", "Phy", "Che"];
  const [selectedSection, setSelectedSection] = useState("All_Sections");
  const [sections, setSections] = useState(["All_Sections"]);
  const [searchInput, setSearchInput] = useState("");
  // const [profileViewStudent, setProfileViewStudent] = useState("");

  const handleCampusChange = (e) => {
    const campus = e.target.value;
    setSelectedCampus(campus);
    setSelectedSection("All_Sections");
    const campusSections =
      campus === "All_Campuses"
        ? ["All_Sections"]
        : [
            "All_Sections",
            ...new Set(
              marksData.filter((item) => item.Campus === campus).map((item) => item.Section)
            ),
          ];
    setSections(campusSections);
    setCurrentPage(1); // Reset to first page when campus is changed
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
    setCurrentPage(1); // Reset to first page when section is changed
  };

  const mentors = useMemo(() => {
    if (selectedCampus === "All_Campuses") {
      return ["All_Mentors", ...new Set(marksData.map((item) => item.Mentor))];
    } else {
      return [
        "All_Mentors",
        ...new Set(
          marksData.filter((item) => item.Campus === selectedCampus).map((item) => item.Mentor)
        ),
      ];
    }
  }, [marksData, selectedCampus]);

  const handleMentorChange = (e) => {
    setSelectedMentor(e.target.value);
    setCurrentPage(1); // Reset to first page when mentor is changed
  };

  const filteredMarksData = useMemo(() => {
    let data = marksData;
    if (selectedCampus !== "All_Campuses") {
      data = data.filter((item) => item.Campus === selectedCampus);
    }
    if (selectedSection !== "All_Sections") {
      data = data.filter((item) => item.Section === selectedSection);
    }
    if (selectedMentor !== "All_Mentors") {
      data = data.filter((item) => item.Mentor === selectedMentor);
    }
    if (searchInput) {
      data = data.filter(
        (item) =>
          item.StudentName.toLowerCase().includes(searchInput.toLowerCase()) ||
          item.RollNo.toLowerCase().includes(searchInput.toLowerCase())
      );
    }
    return data;
  }, [marksData, selectedCampus, selectedSection, selectedMentor, searchInput]);

  // Compute averages and sort data
  const sortedMarksData = useMemo(() => {
    return filteredMarksData
      .map((item) => ({
        ...item,
        averages: calculateAverages(item.WeekendMarks),
      }))
      .sort((a, b) => b.averages.Tot - a.averages.Tot);
  }, [filteredMarksData]);
  // Calculate the total number of pages
  const totalPages = Math.ceil(sortedMarksData.length / recordsPerPage);

  // Function to calculate averages
  function calculateAverages(marks) {
    const totals = { Mat: 0, Phy: 0, Che: 0, Tot: 0 };
    const counts = { Mat: 0, Phy: 0, Che: 0, Tot: 0 };

    marks.forEach((mark) => {
      if (mark.Mat !== "A") {
        totals.Mat += parseInt(mark.Mat, 10);
        counts.Mat += 1;
      }
      if (mark.Phy !== "A") {
        totals.Phy += parseInt(mark.Phy, 10);
        counts.Phy += 1;
      }
      if (mark.Che !== "A") {
        totals.Che += parseInt(mark.Che, 10);
        counts.Che += 1;
      }
      if (mark.Tot !== "A") {
        totals.Tot += parseInt(mark.Tot, 10);
        counts.Tot += 1;
      }
    });

    return {
      Mat: counts.Mat ? (totals.Mat / counts.Mat).toFixed(2) : "N/A",
      Phy: counts.Phy ? (totals.Phy / counts.Phy).toFixed(2) : "N/A",
      Che: counts.Che ? (totals.Che / counts.Che).toFixed(2) : "N/A",
      Tot: counts.Tot ? (totals.Tot / counts.Tot).toFixed(2) : "N/A",
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
      "Campus",
      "Mentor",
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
        item.Campus,
        item.Mentor,
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

  const printableTableRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printableTableRef.current,
  });

  const [modal, setModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAverages, setStudentAverages] = useState({ Mat: 0, Phy: 0, Che: 0, Tot: 0 });
  // Handle modal toggle
  const toggleModal = () => setModal(!modal);

  // Handle student name click
  const handleStudentDetails = (student) => {
    setSelectedStudent(student);

    const totals = { Mat: 0, Phy: 0, Che: 0, Tot: 0 };
    let count = 0;

    student.WeekendMarks.forEach((mark) => {
      if (mark.Mat !== "A") {
        totals.Mat += parseInt(mark.Mat, 10) || 0;
        count++;
      }
      if (mark.Phy !== "A") {
        totals.Phy += parseInt(mark.Phy, 10) || 0;
      }
      if (mark.Che !== "A") {
        totals.Che += parseInt(mark.Che, 10) || 0;
      }
      if (mark.Tot !== "A") {
        totals.Tot += parseInt(mark.Tot, 10) || 0;
      }
    });

    const averageMat = count ? (totals.Mat / count).toFixed(2) : "N/A";
    const averagePhy = count ? (totals.Phy / count).toFixed(2) : "N/A";
    const averageChe = count ? (totals.Che / count).toFixed(2) : "N/A";
    const averageTot = count ? (totals.Tot / count).toFixed(2) : "N/A";

    setStudentAverages({
      Mat: averageMat,
      Phy: averagePhy,
      Che: averageChe,
      Tot: averageTot,
    });

    toggleModal();
  };

  // const handleStuProfileData = (selRollNo) => {
  //   const selectedStudent = stuData.find((student) => student.RollNo === selRollNo);
  //   setProfileViewStudent(selectedStudent);
  // };

  return (
    <Fragment>
      <div className="d-flex justify-content-between">
        <div>
          <div>
            <Button
              color="primary"
              size="sm"
              style={{ marginRight: "5px", borderRadius: "5px" }}
              onClick={exportToExcel}
            >
              <span className="text-white">Excel Export</span>
            </Button>
            <Button
              color="danger"
              size="sm"
              style={{ marginRight: "5px", borderRadius: "5px" }}
              onClick={handlePrint}
            >
              <Print />
            </Button>
          </div>
        </div>
        <div className="mb-1 justify-content-right">
          <Row>
            <Col>
              <Input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search Student...."
                aria-label="Search Student Name"
                style={{ display: "inline", width: "auto", marginRight: "20px", fontSize: "15px" }}
              />
              <Input
                type="select"
                value={selectedCampus}
                onChange={handleCampusChange}
                style={{ display: "inline", width: "auto", marginRight: "20px", fontSize: "15px" }}
              >
                {campuses.map((campus, index) => (
                  <option key={index} value={campus}>
                    {campus}
                  </option>
                ))}
              </Input>
              <Input
                type="select"
                value={selectedSection}
                onChange={handleSectionChange}
                style={{ display: "inline", width: "auto", marginRight: "20px", fontSize: "15px" }}
              >
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </Input>
              <Input
                type="select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{ display: "inline", width: "auto", marginRight: "20px", fontSize: "15px" }}
              >
                {subjects.map((subject, index) => (
                  <option key={index} value={subject}>
                    {subject}
                  </option>
                ))}
              </Input>
              <Input
                type="select"
                value={selectedMentor}
                onChange={handleMentorChange}
                style={{ display: "inline", width: "auto", marginRight: "20px", fontSize: "15px" }}
              >
                {mentors.map((mentor, index) => (
                  <option key={index} value={mentor}>
                    {mentor}
                  </option>
                ))}
              </Input>
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
        <CardBody className="small mb-0 text-center">
          <div ref={printableTableRef}>
            <Table responsive striped bordered hover>
              <thead className="table-warning">
                <tr>
                  <th rowSpan={2}>S.No</th>
                  <th rowSpan={2}>Name of the Student</th>
                  <th rowSpan={2}>Roll No</th>
                  <th rowSpan={2}>Caste</th>
                  <th rowSpan={2}>Campus</th>
                  <th rowSpan={2}>Mentor</th>
                  {viewMode === "all" &&
                    selectedSubject === "All_Subjects" &&
                    allDates.map((date, index) => (
                      <th key={index} colSpan={4} className="text-danger">
                        {date}
                      </th>
                    ))}
                  {viewMode === "all" &&
                    selectedSubject !== "All_Subjects" &&
                    allDates.map((date, index) => (
                      <th key={index} className="text-danger">
                        {date}
                      </th>
                    ))}
                  {viewMode === "totals" &&
                    allDates.map((date, index) => <th key={index}>{date.slice(0, 5)}</th>)}
                  <th colSpan={4}>Averages</th>
                </tr>
                <tr>
                  {viewMode === "all" &&
                    selectedSubject === "All_Subjects" &&
                    allDates.map((date, index) => (
                      <Fragment key={index}>
                        <th>Mat</th>
                        <th>Phy</th>
                        <th>Che</th>
                        <th>Tot</th>
                      </Fragment>
                    ))}
                  {viewMode === "all" &&
                    selectedSubject !== "All_Subjects" &&
                    allDates.map((date, index) => <th key={index}>{selectedSubject}</th>)}
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
                    <td
                      className="text-primary"
                      style={{ cursor: "pointer", textAlign: "left" }}
                      onClick={() => handleStudentDetails(item)}
                    >
                      {item.StudentName}
                    </td>
                    <td>{item.RollNo}</td>
                    <td>{item.Caste}</td>
                    <td>{item.Campus}</td>
                    <td>{item.Mentor}</td>
                    {viewMode === "all" &&
                      selectedSubject === "All_Subjects" &&
                      allDates.map((date, dateIndex) => {
                        const marks = item.WeekendMarks.find((mark) => mark.Date === date) || {};
                        return (
                          <Fragment key={dateIndex}>
                            <td
                              style={{ borderLeft: "2px solid black" }}
                              className={marks.Mat === "A" ? "bg-warning" : ""}
                            >
                              {marks.Mat || "-"}
                            </td>
                            <td className={marks.Phy === "A" ? "bg-warning" : ""}>
                              {marks.Phy || "-"}
                            </td>
                            <td className={marks.Che === "A" ? "bg-warning" : ""}>
                              {marks.Che || "-"}
                            </td>
                            <td
                              style={{ borderRight: "2px solid black" }}
                              className={marks.Tot === "A" ? "bg-warning" : ""}
                            >
                              {marks.Tot || "-"}
                            </td>
                          </Fragment>
                        );
                      })}
                    {viewMode === "all" &&
                      selectedSubject !== "All_Subjects" &&
                      allDates.map((date, dateIndex) => {
                        const marks = item.WeekendMarks.find((mark) => mark.Date === date) || {};
                        return <td key={dateIndex}>{marks[selectedSubject] || "-"}</td>;
                      })}
                    {viewMode === "totals" &&
                      allDates.map((date, dateIndex) => {
                        const marks = item.WeekendMarks.find((mark) => mark.Date === date) || {};
                        return (
                          <td key={dateIndex} className={marks.Tot === "A" ? "bg-warning" : ""}>
                            {marks.Tot || "-"}
                          </td>
                        );
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
                    <td className="text-danger h6">
                      <b className>{item.averages.Tot}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>
      <div className="mt-2 mb-0 d-flex justify-content-between">
        <div className="j">
          <p>{`Showing ${paginatedData.length ? (currentPage - 1) * recordsPerPage + 1 : 0} to ${
            currentPage * recordsPerPage < sortedMarksData.length
              ? currentPage * recordsPerPage
              : sortedMarksData.length
          } of ${sortedMarksData.length} records`}</p>
        </div>
        <div className="text-right">
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
        </div>
      </div>
      {selectedStudent && (
        <Modal
          isOpen={modal}
          toggle={toggleModal}
          className="modal-dialog modal-dialog-centered modal-lg"
        >
          <ModalHeader toggle={toggleModal}>Marks Details </ModalHeader>
          <ModalBody className="text-center h6">
            <div className="d-flex justify-content-between">
              <div>
                <strong>Name:</strong> {selectedStudent.StudentName}
              </div>
              <div>
                <strong>Roll No:</strong> {selectedStudent.RollNo}
              </div>
            </div>
            <div className="d-flex justify-content-between disable-print mt-2">
              <div>
                <strong>Caste:</strong> {selectedStudent.Caste}
              </div>
              <div>
                <strong>Campus:</strong> {selectedStudent.Campus}
              </div>
              {/* <div
                className="text-primary"
                style={{ textDecoration: "underline", cursor: "pointer" }}
                onClick={() => handleStuProfileData(selectedStudent.RollNo)}
              >
                <User size={20} />
                View
              </div> */}
            </div>
            <Table bordered striped responsive className="mt-2">
              <thead className="table-primary font-small">
                <tr>
                  <th>Date</th>
                  <th>Mat</th>
                  <th>Phy</th>
                  <th>Che</th>
                  <th>Tot</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudent.WeekendMarks.map((mark, index) => {
                  // let matStatus = "";
                  // let phyStatus = "";
                  // let cheStatus = "";
                  // let totStatus = "";

                  // if (index > 0) {
                  //   const prevMat =
                  //     selectedStudent.WeekendMarks[index - 1].Mat !== "A"
                  //       ? selectedStudent.WeekendMarks[index - 1].Mat
                  //       : 0;
                  //   const prevPhy =
                  //     selectedStudent.WeekendMarks[index - 1].Phy !== "A"
                  //       ? selectedStudent.WeekendMarks[index - 1].Phy
                  //       : 0;
                  //   const prevChe =
                  //     selectedStudent.WeekendMarks[index - 1].Che !== "A"
                  //       ? selectedStudent.WeekendMarks[index - 1].Che
                  //       : 0;
                  //   const prevTot =
                  //     selectedStudent.WeekendMarks[index - 1].Tot !== "A"
                  //       ? selectedStudent.WeekendMarks[index - 1].Tot
                  //       : 0;

                  //   if (mark.Mat > prevMat) {
                  //     matStatus = <span className="text-success">▲</span>;
                  //   } else if (mark.Mat < prevMat) {
                  //     matStatus = <span className="text-danger">▼</span>;
                  //   }

                  //   if (mark.Phy > prevPhy) {
                  //     phyStatus = <span className="text-success">▲</span>;
                  //   } else if (mark.Phy < prevPhy) {
                  //     phyStatus = <span className="text-danger">▼</span>;
                  //   }

                  //   if (mark.Che > prevChe) {
                  //     cheStatus = <span className="text-success">▲</span>;
                  //   } else if (mark.Che < prevChe) {
                  //     cheStatus = <span className="text-danger">▼</span>;
                  //   }

                  //   if (mark.Tot > prevTot) {
                  //     totStatus = <span className="text-success">▲</span>;
                  //   } else if (mark.Tot < prevTot) {
                  //     totStatus = <span className="text-danger">▼</span>;
                  //   }
                  // }

                  return (
                    <tr key={index}>
                      <td>{mark.Date}</td>
                      <td style={{ position: "relative" }}>
                        {mark.Mat}{" "}
                        {/* <span style={{ position: "absolute", bottom: "0", right: "0" }}>
                          {matStatus}
                        </span> */}
                      </td>
                      <td style={{ position: "relative" }}>
                        {mark.Phy}{" "}
                        {/* <span style={{ position: "absolute", bottom: "0", right: "0" }}>
                          {phyStatus}
                        </span> */}
                      </td>
                      <td style={{ position: "relative" }}>
                        {mark.Che}{" "}
                        {/* <span style={{ position: "absolute", bottom: "0", right: "0" }}>
                          {cheStatus}
                        </span> */}
                      </td>
                      <td style={{ position: "relative" }}>
                        {mark.Tot}{" "}
                        {/* <span style={{ position: "absolute", bottom: "0", right: "0" }}>
                          {totStatus}
                        </span> */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="table-warning">
                  <th className="text-danger">Average</th>
                  <th>{studentAverages.Mat}</th>
                  <th>{studentAverages.Phy}</th>
                  <th>{studentAverages.Che}</th>
                  <th>{studentAverages.Tot}</th>
                </tr>
              </tfoot>
            </Table>
          </ModalBody>
        </Modal>
      )}
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
      Campus: PropTypes.string.isRequired,
      Mentor: PropTypes.string.isRequired,
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
  stuData: PropTypes.arrayOf().isRequired,
};

export default ResultsTable;
