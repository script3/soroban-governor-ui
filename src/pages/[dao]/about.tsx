import DAOLayout from "@/components/Layout/dao/layout";

function About() {
  return (
    <div>
      <h1>About</h1>
    </div>
  );
}

About.getLayout = (page: any) => <DAOLayout>{page}</DAOLayout>;

export default About;
