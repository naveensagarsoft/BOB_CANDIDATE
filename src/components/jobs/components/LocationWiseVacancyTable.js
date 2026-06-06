// src/modules/jobs/components/LocationWiseVacancyTable.jsx
import React from "react";
import { mapVacancyDistributions } from "../../jobs/mappers/vacancyDistributionMapper";
const LocationWiseVacancyTable = ({
  positionStateDistributions = [],
  states = [],
  centerMap = {},
  reservationCategories = [],
  disabilities = [],
  cities=[]
}) => {
  const vacancyDistribution = mapVacancyDistributions(
    positionStateDistributions,
    states,
    centerMap,
    reservationCategories,
    disabilities,
    cities
  );

  if (!vacancyDistribution.length) return null;

  return (
    <div className="info-card mt-3">
      <h6 className="card-section-header">Category Wise Reservation (State-wise)</h6>

      <div className="table-responsive">
        <table className="table table-bordered vacancy-table">
          <thead>
            <tr>
              <th rowSpan="2" style={{ width: "20%" }}>State</th>
              <th rowSpan="2" style={{ width: "20%" }}>City</th>
              {/* <th rowSpan="2">Vacancies</th> */}

              <th colSpan={reservationCategories.length + 1} className="text-center">
                Category
              </th>

              <th colSpan={disabilities.length + 1} className="text-center">
                Disability
              </th>
            </tr>

            <tr>
              {reservationCategories.map(cat => (
                <th key={cat.category_id}>{cat.category_code}</th>
              ))}
              <th>Total</th>

              {disabilities.map(dis => (
                <th key={dis.disability_id}>{dis.disability_code}</th>
              ))}
             
            </tr>
          </thead>

          <tbody>
            {vacancyDistribution.map((dist, index) => {
              const categoryTotal = reservationCategories.reduce(
                (sum, cat) => sum + (dist.categories?.[cat.category_id] || 0),
                0
              );


              return (
                <tr key={index}>
                  <td>{dist.state_name}</td>
                  <td>{dist.city_name}</td>
                  {/* <td>{dist.interview_centre}</td> */}
                  {/* <td>{dist.total}</td> */}

                  {reservationCategories.map(cat => (
                    <td key={cat.category_id}>
                      {dist.categories?.[cat.category_id] || 0}
                    </td>
                  ))}
                  <td>{categoryTotal}</td>

                  {disabilities.map(dis => (
                    <td key={dis.disability_id}>
                      {dist.disability?.[dis.disability_id] || 0}
                    </td>
                  ))}
                 
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LocationWiseVacancyTable;
