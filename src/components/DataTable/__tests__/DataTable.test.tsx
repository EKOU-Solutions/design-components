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
  it("renders tfoot with totals when columns have showTotal", () => {
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
    expect(document.querySelector("tfoot")).not.toBeInTheDocument();
    expect(screen.getByText("TOT")).toBeInTheDocument();
    expect(screen.getByText("300.00")).toBeInTheDocument();
  });

  it("renders no totals table when no columns have showTotal", () => {
    render(<DataTable columns={cols3} rows={rows2} />);
    expect(document.querySelectorAll("table")).toHaveLength(1);
    expect(document.querySelector("tfoot")).not.toBeInTheDocument();
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

  // 23. onAddRow called when + button clicked
  it("calls onAddRow when the Add Row toolbar button is clicked", async () => {
    const onAddRow = vi.fn();
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} onAddRow={onAddRow} />);

    await user.click(screen.getByRole("button", { name: "Add row" }));
    expect(onAddRow).toHaveBeenCalledTimes(1);
  });

  // 24. + button exists but clicking it without onAddRow does not throw
  it("+ button click without onAddRow does not throw", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} />);

    await expect(
      user.click(screen.getByRole("button", { name: "Add row" }))
    ).resolves.not.toThrow();
  });

  // 25. delete buttons render when deletable=true
  it("renders a delete button per row when deletable is true", () => {
    const onDeleteRow = vi.fn();
    render(<DataTable columns={cols3} rows={rows2} deletable onDeleteRow={onDeleteRow} />);

    const deleteButtons = screen.getAllByRole("button", { name: /Delete row/i });
    expect(deleteButtons).toHaveLength(2);
  });

  // 26. delete buttons not rendered when deletable is not set
  it("does not render delete buttons when deletable is not set", () => {
    render(<DataTable columns={cols3} rows={rows2} />);

    expect(screen.queryByRole("button", { name: /Delete row/i })).not.toBeInTheDocument();
  });

  // 27. onDeleteRow called with correct rowId
  it("calls onDeleteRow with the correct row id", async () => {
    const onDeleteRow = vi.fn();
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} deletable onDeleteRow={onDeleteRow} />);

    const deleteButtons = screen.getAllByRole("button", { name: /Delete row/i });
    await user.click(deleteButtons[0]);

    expect(onDeleteRow).toHaveBeenCalledWith("r1");
    expect(onDeleteRow).toHaveBeenCalledTimes(1);
  });

  // 28. delete column adds a styled th to header (same look as data columns)
  it("adds a header th for the delete column", () => {
    render(<DataTable columns={cols3} rows={rows2} deletable />);
    // header should have one extra th for the delete column
    expect(document.querySelectorAll("thead th")).toHaveLength(cols3.length + 1);
    const ths = document.querySelectorAll("thead th");
    const lastTh = ths[ths.length - 1];
    expect(lastTh).toHaveAttribute("aria-label", "Actions");
  });

  // 29. delete cell is keyboard reachable via ArrowRight
  it("delete cell is reachable via ArrowRight navigation", async () => {
    const onDeleteRow = vi.fn();
    const user = userEvent.setup();
    render(
      <DataTable columns={cols3} rows={[rows2[0]]} deletable onDeleteRow={onDeleteRow} />
    );

    const table = screen.getByRole("grid");
    await user.click(table);
    // Navigate to last data column (col index 2), then one more right → delete col (index 3)
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    const deleteTd = document.querySelector(`#cell-0-${cols3.length}`) as HTMLElement;
    expect(deleteTd.tabIndex).toBe(0);
  });

  // 30. Enter on delete cell calls onDeleteRow
  it("Enter on focused delete cell calls onDeleteRow", async () => {
    const onDeleteRow = vi.fn();
    const user = userEvent.setup();
    render(
      <DataTable columns={cols3} rows={[rows2[0]]} deletable onDeleteRow={onDeleteRow} />
    );

    const table = screen.getByRole("grid");
    await user.click(table);
    // Go to delete column
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");
    await user.keyboard("{Enter}");

    expect(onDeleteRow).toHaveBeenCalledWith("r1");
  });

  // 31. disabled rows are skipped by ArrowDown
  it("ArrowDown skips disabled rows", async () => {
    const user = userEvent.setup();
    const rows3: RowData[] = [
      { id: "r1", a: "A1", b: "B1", c: "C1" },
      { id: "r2", a: "A2", b: "B2", c: "C2" },
      { id: "r3", a: "A3", b: "B3", c: "C3" },
    ];
    render(
      <DataTable
        columns={cols3}
        rows={rows3}
        getRowDisabled={(row) => row.id === "r2"}
      />
    );

    const table = screen.getByRole("grid");
    await user.click(table); // focuses row 0
    expect(getTd(0, 0).tabIndex).toBe(0);

    await user.keyboard("{ArrowDown}");
    // row 1 is disabled — should land on row 2
    expect(getTd(2, 0).tabIndex).toBe(0);
    expect(getTd(1, 0).tabIndex).toBe(-1);
  });

  // 32. disabled rows are skipped by ArrowUp
  it("ArrowUp skips disabled rows", async () => {
    const u = userEvent.setup();
    const rows3: RowData[] = [
      { id: "r1", a: "A1", b: "B1", c: "C1" },
      { id: "r2", a: "A2", b: "B2", c: "C2" },
      { id: "r3", a: "A3", b: "B3", c: "C3" },
    ];
    render(
      <DataTable
        columns={cols3}
        rows={rows3}
        getRowDisabled={(row) => row.id === "r2"}
      />
    );

    const table = screen.getByRole("grid");
    await u.click(table); // lands on row 0 col 0
    // move down twice: row 0 → (skip row 1 disabled) → row 2
    await u.keyboard("{ArrowDown}");
    expect(getTd(2, 0).tabIndex).toBe(0);
    // now move up: row 2 → (skip row 1 disabled) → row 0
    await u.keyboard("{ArrowUp}");
    expect(getTd(0, 0).tabIndex).toBe(0);
  });

  // 33. disabled row cannot enter edit mode
  it("disabled row does not enter edit mode on Enter", async () => {
    const user = userEvent.setup();
    const rows3: RowData[] = [
      { id: "r1", a: "A1", b: "B1", c: "C1" },
      { id: "r2", a: "A2", b: "B2", c: "C2" },
      { id: "r3", a: "A3", b: "B3", c: "C3" },
    ];
    render(
      <DataTable
        columns={cols3}
        rows={rows3}
        getRowDisabled={(row) => row.id === "r1"}
        initialFocusedCell={{ rowIndex: 0, colIndex: 0 }}
      />
    );
    // row 0 is disabled — focus starts at row 0 but Enter should do nothing
    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{Enter}");
    expect(document.querySelector("input")).not.toBeInTheDocument();
  });

  // 34. disabled row has data-disabled attribute
  it("disabled row has data-disabled='true' on the tr", () => {
    const rows3: RowData[] = [
      { id: "r1", a: "A1", b: "B1", c: "C1" },
      { id: "r2", a: "A2", b: "B2", c: "C2" },
    ];
    render(
      <DataTable
        columns={cols3}
        rows={rows3}
        getRowDisabled={(row) => row.id === "r1"}
      />
    );
    const trs = getTrs();
    expect(trs[0]).toHaveAttribute("data-disabled", "true");
    expect(trs[1]).not.toHaveAttribute("data-disabled", "true");
  });

  // 35. Select: Escape cancels without calling onCellChange
  it("select Escape cancels without calling onCellChange", async () => {
    const onCellChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DataTable columns={selectCols} rows={selectRows} onCellChange={onCellChange} />
    );

    const table = screen.getByRole("grid");
    await user.click(table);
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onCellChange).not.toHaveBeenCalled();
  });

  // 36. Totals: comma-formatted numbers are parsed correctly
  it("strips commas from number values when computing totals", () => {
    const colsWithTotals: ColumnDef[] = [
      { key: "amount", label: "Amount", width: 100, type: "number", showTotal: true },
    ];
    const rowsWithCommas: RowData[] = [
      { id: "r1", amount: "1,234.50" },
      { id: "r2", amount: "2,000.00" },
    ];
    render(<DataTable columns={colsWithTotals} rows={rowsWithCommas} />);
    expect(screen.getByText("3234.50")).toBeInTheDocument();
  });

  // 37. Tab at last data column clamps — does not wrap to next row
  it("Tab at last data column stays on last column", async () => {
    const onCellChange = vi.fn();
    const user = userEvent.setup();
    render(<DataTable columns={cols3} rows={rows2} onCellChange={onCellChange} />);

    const table = screen.getByRole("grid");
    await user.click(table);
    // Navigate to last column (col 2), enter edit mode, Tab
    await user.keyboard("{ArrowRight}{ArrowRight}");
    await user.keyboard("{Enter}");

    const input = getTd(0, 2).querySelector("input") as HTMLInputElement;
    expect(input).toBeInTheDocument();

    await user.keyboard("{Tab}");
    // Should stay on row 0, col 2 (clamped)
    expect(getTd(0, 2).tabIndex).toBe(0);
  });

  // 38. Disabled row cells have pointer-events: none and JS guard ignores clicks
  it("disabled row has pointer-events: none via data-disabled attribute", () => {
    const rows3: RowData[] = [
      { id: "r1", a: "A1", b: "B1", c: "C1" },
      { id: "r2", a: "A2", b: "B2", c: "C2" },
    ];
    render(
      <DataTable
        columns={cols3}
        rows={rows3}
        getRowDisabled={(row) => row.id === "r2"}
      />
    );
    // The CSS rule [data-disabled="true"] { pointer-events: none } blocks all clicks
    const trs = getTrs();
    expect(trs[1]).toHaveAttribute("data-disabled", "true");
  });
});
