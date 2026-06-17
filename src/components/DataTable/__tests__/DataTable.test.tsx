import React, { useState } from "react";
import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataTable } from "../DataTable";
import type { ColumnDef, RowData } from "../types";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const cols3: ColumnDef[] = [
  { key: "a", label: "Col A", width: 100, type: "string" },
  { key: "b", label: "Col B", width: 100, type: "string" },
  { key: "c", label: "Col C", width: 100, type: "string" },
];

const rows2: RowData[] = [
  { id: "r1", a: "A1", b: "B1", c: "C1" },
  { id: "r2", a: "A2", b: "B2", c: "C2" },
];

const selectCols: ColumnDef[] = [
  { key: "name", label: "Name", width: 120, type: "string" },
  {
    key: "status",
    label: "Status",
    width: 140,
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Pending", value: "pending" },
    ],
  },
];

const selectRows: RowData[] = [{ id: "r1", name: "Alice", status: "" }];

// Helper: get <td> by row/col index
function getTd(rowIndex: number, colIndex: number) {
  return document.querySelector(`#cell-${rowIndex}-${colIndex}`) as HTMLElement;
}

// Helper: get all <tr> in tbody
function getTrs() {
  return document.querySelectorAll("tbody tr");
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("DataTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  // 1. Renders columns and rows
  it("renders column headers and cell values", () => {
    render(<DataTable columns={cols3} rows={rows2} />);
    expect(screen.getByText("Col A")).toBeInTheDocument();
    expect(screen.getByText("Col B")).toBeInTheDocument();
    expect(screen.getByText("Col C")).toBeInTheDocument();
    expect(screen.getByText("A1")).toBeInTheDocument();
    expect(screen.getByText("B2")).toBeInTheDocument();
    expect(screen.getByText("C2")).toBeInTheDocument();
  });

  // 2. Keyboard navigation — arrow keys
  it("navigates cells with arrow keys", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} />);

    const table = screen.getByRole("grid");
    await user.click(table);

    expect(getTd(0, 0).tabIndex).toBe(0);

    await user.keyboard("{ArrowRight}");
    expect(getTd(0, 1).tabIndex).toBe(0);
    expect(getTd(0, 0).tabIndex).toBe(-1);

    await user.keyboard("{ArrowDown}");
    expect(getTd(1, 1).tabIndex).toBe(0);

    await user.keyboard("{ArrowLeft}");
    expect(getTd(1, 0).tabIndex).toBe(0);

    await user.keyboard("{ArrowUp}");
    expect(getTd(0, 0).tabIndex).toBe(0);
  });

  it("clamps navigation at boundaries", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} />);

    const table = screen.getByRole("grid");
    await user.click(table);

    await user.keyboard("{ArrowLeft}");
    expect(getTd(0, 0).tabIndex).toBe(0);

    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowDown}");
    expect(getTd(1, 2).tabIndex).toBe(0);

    await user.keyboard("{ArrowRight}");
    expect(getTd(1, 2).tabIndex).toBe(0);

    await user.keyboard("{ArrowDown}");
    expect(getTd(1, 2).tabIndex).toBe(0);
  });

  // 3. Home/End/Ctrl+Home/Ctrl+End
  it("navigates with Home, End, Ctrl+Home, Ctrl+End", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} />);

    const table = screen.getByRole("grid");
    await user.click(table);

    await user.keyboard("{ArrowRight}");
    expect(getTd(0, 1).tabIndex).toBe(0);

    await user.keyboard("{Home}");
    expect(getTd(0, 0).tabIndex).toBe(0);

    await user.keyboard("{End}");
    expect(getTd(0, 2).tabIndex).toBe(0);

    await user.keyboard("{Control>}{Home}{/Control}");
    expect(getTd(0, 0).tabIndex).toBe(0);

    await user.keyboard("{Control>}{End}{/Control}");
    expect(getTd(1, 2).tabIndex).toBe(0);
  });

  // 4. Enter enters edit mode
  it("enters edit mode on Enter", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} />);

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{Enter}");

    expect(getTd(0, 0).querySelector("input")).toBeInTheDocument();
  });

  it("enters edit mode on F2", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} />);

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{F2}");

    expect(getTd(0, 0).querySelector("input")).toBeInTheDocument();
  });

  // 5. Escape exits edit mode
  it("exits edit mode on Escape", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} />);

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{Enter}");
    expect(getTd(0, 0).querySelector("input")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(getTd(0, 0).querySelector("input")).not.toBeInTheDocument();
    expect(getTd(0, 0).tabIndex).toBe(0);
  });

  // 6. Tab commits and moves focus
  it("Tab commits value and moves to next cell", async () => {
    const onCellChange = vi.fn();
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} onCellChange={onCellChange} />);

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");

    const input = getTd(0, 1).querySelector("input") as HTMLInputElement;
    expect(input).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "test");
    await user.keyboard("{Tab}");

    expect(onCellChange).toHaveBeenCalledWith("r1", "b", "test");
    expect(getTd(0, 2).tabIndex).toBe(0);
  });

  // 7. onCellChange called on Enter commit
  it("calls onCellChange with new value on Enter commit", async () => {
    const onCellChange = vi.fn();
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} onCellChange={onCellChange} />);

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{Enter}");

    const input = getTd(0, 0).querySelector("input") as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "hello");
    await user.keyboard("{Enter}");

    expect(onCellChange).toHaveBeenCalledWith("r1", "a", "hello");
  });

  // 8. Edit mode — row gets data-editing="true"
  it("sets data-editing on the active row in edit mode", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} />);

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{Enter}");

    const trs = getTrs();
    expect(trs[0]).toHaveAttribute("data-editing", "true");
    expect(trs[1]).not.toHaveAttribute("data-editing", "true");
  });

  it("row does not have data-editing when only navigating", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} />);

    const table = screen.getByRole("grid");
    await user.click(table);

    const trs = getTrs();
    expect(trs[0]).not.toHaveAttribute("data-editing", "true");
  });

  // 9. Focused cell in nav mode — data-focused attribute (yellow state)
  it("sets data-focused on focused cell in navigation mode (yellow)", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} />);

    const table = screen.getByRole("grid");
    await user.click(table);

    expect(getTd(0, 0)).toHaveAttribute("data-focused", "true");
    expect(getTrs()[0]).not.toHaveAttribute("data-editing", "true");
  });

  it("data-focused moves with navigation", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} />);

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{ArrowRight}");

    expect(getTd(0, 0)).not.toHaveAttribute("data-focused", "true");
    expect(getTd(0, 1)).toHaveAttribute("data-focused", "true");
  });

  // 10. Editing cell has input, others don't
  it("only the editing cell contains an input", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} />);

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");

    expect(getTd(0, 1).querySelector("input")).toBeInTheDocument();
    expect(getTd(0, 0).querySelector("input")).not.toBeInTheDocument();
    expect(getTd(0, 2).querySelector("input")).not.toBeInTheDocument();
  });

  // 11. Select column opens listbox
  it("opens custom listbox for select-type columns", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={selectCols} rows={selectRows} />);

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  // 12. onCellChange fires with selected option value
  it("calls onCellChange with option value when selecting from listbox", async () => {
    const onCellChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DataTable columns={selectCols} rows={selectRows} onCellChange={onCellChange} />
    );

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");

    await user.click(screen.getByText("Inactive"));
    expect(onCellChange).toHaveBeenCalledWith("r1", "status", "inactive");
  });

  // 13. height prop — fixed number sets max-height
  it("applies max-height inline style when height is a number", () => {
    render(<DataTable columns={cols3} rows={rows2} height={250} />);
    const wrapper = document.querySelector("[data-scroll-wrapper]") as HTMLElement;
    expect(wrapper.style.maxHeight).toBe("250px");
  });

  // 14. height="fill" — data-fill attribute set
  it("sets data-fill when height is fill", () => {
    const { container } = render(
      <div style={{ height: 400 }}>
        <DataTable columns={cols3} rows={rows2} height="fill" />
      </div>
    );
    const root = container.querySelector("[data-fill='true']");
    expect(root).toBeInTheDocument();
  });

  it("does not set data-fill when height is a number", () => {
    const { container } = render(
      <DataTable columns={cols3} rows={rows2} height={300} />
    );
    expect(container.querySelector("[data-fill='true']")).not.toBeInTheDocument();
  });

  // 15. initialFocusedCell pre-focuses a cell
  it("pre-focuses cell from initialFocusedCell prop without interaction", () => {
    render(
      <DataTable
        columns={cols3}
        rows={rows2}
        initialFocusedCell={{ rowIndex: 1, colIndex: 2 }}
      />
    );
    expect(getTd(1, 2).tabIndex).toBe(0);
    expect(getTd(0, 0).tabIndex).toBe(-1);
  });

  // 16. Totals row — auto-computed from column config
  it("renders two tables when columns have showTotal", () => {
    const colsWithTotals: ColumnDef[] = [
      { key: "label", label: "Label", width: 80, showTotal: true, totalLabel: "TOT" },
      { key: "amount", label: "Amount", width: 100, type: "number", showTotal: true },
      { key: "other", label: "Other", width: 100 },
    ];
    const rowsWithNums: RowData[] = [
      { id: "r1", label: "A", amount: "100", other: "x" },
      { id: "r2", label: "B", amount: "200", other: "y" },
    ];
    render(<DataTable columns={colsWithTotals} rows={rowsWithNums} />);
    expect(document.querySelectorAll("table")).toHaveLength(2);
    expect(screen.getByText("TOT")).toBeInTheDocument();
    expect(screen.getByText("300.00")).toBeInTheDocument();
  });

  it("renders only one table when no columns have showTotal", () => {
    render(<DataTable columns={cols3} rows={rows2} />);
    expect(document.querySelectorAll("table")).toHaveLength(1);
  });

  // 17. Totals auto-update when rows change
  it("totals update reactively when rows are re-rendered with new values", () => {
    const colsWithTotals: ColumnDef[] = [
      { key: "val", label: "Value", width: 100, type: "number", showTotal: true },
    ];
    const initialRows: RowData[] = [{ id: "r1", val: "10" }];

    function Wrapper() {
      const [rows, setRows] = useState<RowData[]>(initialRows);
      return (
        <>
          <DataTable columns={colsWithTotals} rows={rows} />
          <button onClick={() => setRows([{ id: "r1", val: "999" }])}>update</button>
        </>
      );
    }

    render(<Wrapper />);
    expect(screen.getByText("10.00")).toBeInTheDocument();

    act(() => {
      screen.getByText("update").click();
    });
    expect(screen.getByText("999.00")).toBeInTheDocument();
    expect(screen.queryByText("10.00")).not.toBeInTheDocument();
  });

  // 18. editable=false prevents edit mode
  it("does not enter edit mode for non-editable columns", async () => {
    const readOnlyCols: ColumnDef[] = [
      { key: "a", label: "A", width: 100, editable: false },
      { key: "b", label: "B", width: 100 },
    ];
    const user = userEvent.setup();
    render(<DataTable columns={readOnlyCols} rows={rows2} />);

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{Enter}");

    expect(document.querySelector("input")).not.toBeInTheDocument();
  });

  // 19. Fully data-driven — columns drive structure
  it("renders exactly the right number of headers and cells", () => {
    const { unmount } = render(
      <DataTable columns={[cols3[0]]} rows={[rows2[0]]} />
    );
    expect(document.querySelectorAll("thead th")).toHaveLength(1);
    expect(document.querySelectorAll("tbody td")).toHaveLength(1);
    unmount();

    render(<DataTable columns={cols3} rows={rows2} />);
    expect(document.querySelectorAll("thead th")).toHaveLength(3);
    expect(document.querySelectorAll("tbody td")).toHaveLength(6);
  });

  // 20. onCellChange is optional — no crash without it
  it("works without onCellChange (read-only usage)", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} />);

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{Enter}");

    const input = getTd(0, 0).querySelector("input") as HTMLInputElement;
    await user.type(input, "x");
    await user.keyboard("{Enter}");
  });

  // 21. Select: ArrowDown navigates options without moving table focus
  it("select ArrowDown navigates highlighted option without moving table focus", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={selectCols} rows={selectRows} />);

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // First option should be highlighted
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("data-highlighted", "true");

    // ArrowDown moves highlight to second option, table focus stays at (0,1)
    await user.keyboard("{ArrowDown}");
    expect(options[0]).not.toHaveAttribute("data-highlighted", "true");
    expect(options[1]).toHaveAttribute("data-highlighted", "true");
    expect(getTd(0, 1).tabIndex).toBe(0);
  });

  // 22. Select: Enter commits highlighted option
  it("select Enter commits highlighted option", async () => {
    const onCellChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DataTable columns={selectCols} rows={selectRows} onCellChange={onCellChange} />
    );

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");

    // ArrowDown to second option, Enter to commit
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(onCellChange).toHaveBeenCalledWith("r1", "status", "inactive");
  });
});
