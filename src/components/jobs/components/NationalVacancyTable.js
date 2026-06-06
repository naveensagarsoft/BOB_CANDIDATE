// src/modules/jobs/components/NationalVacancyTable.jsx
import React from "react";
import { mapNationalVacancyDistributions } from "../mappers/NationalVacancyDistributionMapper";

const NationalVacancyTable = ({
  positionCategoryNationalDistributions = [],
  reservationCategories = [],
  disabilities = []
}) => {
  const distribution = mapNationalVacancyDistributions(
    positionCategoryNationalDistributions,
    reservationCategories,
    disabilities
  );

  if (!distribution) return null;
  const categoryTotal = reservationCategories.reduce(
    (sum, cat) => sum + (distribution.categories?.[cat.category_id] || 0),
    0
  );


  return (
    <div className="info-card mt-3">
      <h6 className="card-section-header">Category Wise Reservation</h6>

      <div className="table-responsive">
        <table className="table table-bordered vacancy-table">
          <thead>
            <tr>
              {/* <th rowSpan="2">Vacancies</th> */}

              <th colSpan={reservationCategories.length + 1} className="text-center">
                 Category
              </th>

              <th colSpan={disabilities.length} className="text-center">
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
            <tr>
             
              {reservationCategories.map(cat => (
                <td key={cat.category_id}>
                  {distribution.categories?.[cat.category_id] || 0}
                </td>
              ))}
              <td>{categoryTotal}</td>

              {disabilities.map(dis => (
                <td key={dis.disability_id}>
                  {distribution.disability?.[dis.disability_id] || 0}
                </td>
              ))}
             
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NationalVacancyTable;
