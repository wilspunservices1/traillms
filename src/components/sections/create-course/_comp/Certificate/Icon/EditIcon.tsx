import React from 'react';

type Props = React.SVGProps<SVGSVGElement>;

const EditIcon: React.FC<Props> = ({
  fill = 'none',
  stroke = 'currentColor',
  width = '1em',
  height = '1em',
  className,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 21 21"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill={fill}
      stroke={stroke}
      {...props}
    >
      <g
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(3 3)"
      >
        <path d="M7 1.5H2.5c-1.1046 0-2 .8954-2 2v9.0004c0 1.1046.8954 2 2 2h10c1.1046 0 2-.8954 2-2v-4.5004" />
        <path d="M14.5.4667c.5549.5734.5474 1.4859-.0168 2.0501l-6.9832 6.9832-3 1 1-3 6.9874-7.0456c.5136-.5179 1.3297-.5535 1.8849-.1045z" />
        <path d="M12.5 2.5l.953 1" />
      </g>
    </svg>
  );
};

export default EditIcon;
