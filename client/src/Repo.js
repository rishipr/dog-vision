import React from "react";
import "./Repo.scss";

const Repo = (props) => {
  return (
    <a
      href={props.url}
      className={props.classN}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.icon}
      <div>{props.title}</div>
    </a>
  );
};

export default Repo;
