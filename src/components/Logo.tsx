import { Blocks } from "lucide-react";

export const Logo = () => {
  return (
    <div className={`flex flex-row items-center justify-center px-5`}>
      <div className="me-2 flex h-[40px] items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
        <Blocks className="h-10 w-10" />
      </div>
      <h5 className="text-foreground text-2xl font-bold leading-5 dark:text-white">
        NextPress
      </h5>
    </div>
  );
};

export const EmailLogo = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          marginRight: "10px",
          display: "flex",
          height: "40px",
          width: "40px",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "5px",
          backgroundColor: "#18181b", // Equivalent to bg-zinc-950
          color: "#ffffff", // Text color
        }}
      >
        <Blocks style={{ height: "40px", width: "40px" }} />
      </div>
      <h5
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#18181b",
          margin: 0,
        }}
      >
        NextPress
      </h5>
    </div>
  );
};
