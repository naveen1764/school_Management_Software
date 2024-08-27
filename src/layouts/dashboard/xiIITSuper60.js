import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import PropTypes from "prop-types";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import { Badge, Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { Eye } from "react-feather";
import ResultsTable from "examples/Tables/DataTable";
import { useNavigate } from "react-router-dom";
import "styles.css";

const XIIITSuper60 = ({ stuData }) => {
  const navigate = useNavigate();
  const [weekendxi, setWeekendxi] = useState({
    labels: [],
    datasets: { label: "MAINS", data: [] },
  });

  const [organizedData, setOrganizedData] = useState([]);
  const [finalData, setFinalData] = useState([]);
  const [selectedOption, setSelectedOption] = useState(0);
  const [selFilData, setSelFilData] = useState([]);
  const [resultOpenModal, setResultOpenModal] = useState(false);

  const selOptions = [
    { value: 0, label: "Overall" },
    { value: 1, label: "Latest 1 Week" },
    { value: 2, label: "Latest 2 Weeks" },
    { value: 3, label: "Latest 3 Weeks" },
    { value: 4, label: "Latest 4 Weeks" },
    { value: 5, label: "Latest 5 Weeks" },
    { value: 6, label: "Latest 6 Weeks" },
    { value: 7, label: "Latest 7 Weeks" },
    { value: 8, label: "Latest 8 Weeks" },
    { value: 9, label: "Latest 9 Weeks" },
    { value: 10, label: "Latest 10 Weeks" },
    { value: 11, label: "Latest 11 Weeks" },
    { value: 12, label: "Latest 12 Weeks" },
    { value: 13, label: "Latest 13 Weeks" },
    { value: 14, label: "Latest 14 Weeks" },
    { value: 15, label: "Latest 15 Weeks" },
    { value: 20, label: "Latest 20 Weeks" },
  ];

  // useEffect(() => {
  //   axios
  //     .get(`https://sheet.best/api/sheets/25cbcbf1-c2a1-44c7-8361-2cec8710557e`)
  //     .then((response) => {
  //       super60OrganizeData(response.data);
  //     });
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://script.google.com/macros/s/AKfycby6w6QHOK5b1H0B4SjTMSG21XmNGMW8dY1HRnOOBApRt1nmPAT-NeM1Xs2EeIt5VtZ9Pw/exec"
        );
        super60OrganizeData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const super60OrganizeData = (data) => {
    const result = data.map((student) => {
      const weekendMarks = [];
      for (let i = 1; i <= student.ConductExams; i++) {
        weekendMarks.push({
          Date: student[`W-${i}`],
          Mat: student[`Mat-${i}`],
          Phy: student[`Phy-${i}`],
          Che: student[`Che-${i}`],
          Tot: student[`Tot-${i}`],
        });
      }
      return {
        StudentName: student.StudentName,
        RollNo: student.RollNo,
        Caste: student.Caste,
        Gender: student.Gender,
        Section: student.Section,
        Campus: student.Campus,
        Mentor: student.Mentor,
        WeekendMarks: weekendMarks,
      };
    });
    setOrganizedData(result);
  };

  useEffect(() => {
    // if (stuData.length > 0) {
    const filteredData = organizedData.filter((student) =>
      stuData.some((stu) => stu.RollNo === student.RollNo)
    );
    setFinalData(filteredData);
    // }
  }, [stuData, organizedData]);

  useEffect(() => {
    if (finalData.length > 0) {
      generateChartData(finalData);
    }
  }, [finalData, selectedOption]);

  const generateChartData = (data) => {
    let labels = [];
    let datasetsData = {};

    const numberOfWeeks = selectedOption === 0 ? undefined : parseInt(selectedOption);

    data.forEach((student) => {
      const weekendMarks = numberOfWeeks
        ? student.WeekendMarks.slice(-numberOfWeeks)
        : student.WeekendMarks;

      weekendMarks.forEach((weekendMark) => {
        const { Date: date, Tot: tot } = weekendMark;
        if (tot !== "A") {
          const totValue = parseInt(tot);
          if (!labels.includes(date)) {
            labels.push(date);
            datasetsData[date] = totValue;
          } else {
            datasetsData[date] = Math.max(datasetsData[date], totValue);
          }
        }
      });
    });

    labels.sort(
      (a, b) =>
        new Date(a.split(".").reverse().join("-")) - new Date(b.split(".").reverse().join("-"))
    );

    const sortedDatasetData = labels.map((date) => datasetsData[date]);

    setWeekendxi({
      labels,
      datasets: { label: "TOP MARK", data: sortedDatasetData },
    });
  };

  const handleOptionChange = (e) => {
    setSelectedOption(parseInt(e.target.value));
  };

  useEffect(() => {
    if (selectedOption === 0) {
      setSelFilData(finalData);
    } else {
      const numberOfWeeks = parseInt(selectedOption);
      const filteredData = finalData.map((student) => ({
        ...student,
        WeekendMarks: student.WeekendMarks.slice(-numberOfWeeks),
      }));
      setSelFilData(filteredData);
    }
  }, [selectedOption, finalData]);

  const handleResultView = () => {
    setResultOpenModal(!resultOpenModal);
  };

  return (
    <Fragment>
      <ReportsLineChart
        color="success"
        title={
          <div className="d-flex justify-content-between align-items-center mb-0">
            <div className="h5 text-success">XII - IIT Super60 (2024-25)</div>
            <div>
              <select
                id="selectOptions"
                className="form-control"
                value={selectedOption}
                onChange={handleOptionChange}
              >
                {selOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Button size="sm rounded" color="danger" onClick={handleResultView}>
                <Eye size={15} /> View Result
              </Button>
            </div>
          </div>
        }
        chart={weekendxi}
      />
      <Modal
        isOpen={resultOpenModal}
        className="modal-dialog modal-dialog-centered modal-xxl"
        toggle={() => setResultOpenModal(false)}
      >
        <ModalHeader toggle={() => setResultOpenModal(false)}>
          XII - Super 60 (IIT) JEE-MAINS Model -{" "}
          <Badge color="danger">
            {selOptions.find((ff) => ff.value === selectedOption)?.label || ""} - Results
          </Badge>
        </ModalHeader>
        <ModalBody className="h6">
          <ResultsTable
            marksData={selectedOption !== 0 ? selFilData : finalData}
            stuData={stuData}
          />
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

XIIITSuper60.propTypes = {
  stuData: PropTypes.array.isRequired,
};

export default XIIITSuper60;
