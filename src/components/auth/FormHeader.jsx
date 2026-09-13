const FormHeader = ({ heading, description }) => {
  return (
    <>
      <h2 className="text-2xl font-bold tracking-[-0.02em]">{heading}</h2>

      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </>
  );
};

export default FormHeader;
