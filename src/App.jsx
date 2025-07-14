// MIGLIORAMENTI GRAFICI + UX/UI
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns";

const teamMembers = ["Nicola", "Andrea", "Mirko", "Georgina"];
const tagOptions = ["Urgente", "Normale", "Bassa Priorità"];
const tagColors = {
  "Urgente": "bg-red-200 text-red-800",
  "Normale": "bg-yellow-200 text-yellow-800",
  "Bassa Priorità": "bg-green-200 text-green-800"
};

const loadFromStorage = () => {
  const saved = localStorage.getItem("taskColumns");
  return saved ? JSON.parse(saved) : {
    "To Do": [],
    "In Progress": [],
    "Done": []
  };
};

export default function TrelloApp() {
  const [columns, setColumns] = useState(loadFromStorage);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTag, setNewTag] = useState("");
  const [editTask, setEditTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTag, setEditTag] = useState("");

  useEffect(() => {
    localStorage.setItem("taskColumns", JSON.stringify(columns));
  }, [columns]);

  const moveCard = (from, to, cardIndex) => {
    const fromCol = [...columns[from]];
    const toCol = [...columns[to]];
    const [moved] = fromCol.splice(cardIndex, 1);
    toCol.push(moved);
    setColumns({ ...columns, [from]: fromCol, [to]: toCol });
  };

  const deleteCard = (col, cardIndex) => {
    const colCopy = [...columns[col]];
    colCopy.splice(cardIndex, 1);
    setColumns({ ...columns, [col]: colCopy });
  };

  const addTask = () => {
    if (!newTitle.trim() || !newAssignee || !newTag) return;
    const newTask = {
      id: Date.now(),
      title: newTitle,
      assignedTo: newAssignee,
      dueDate: newDueDate,
      description: newDescription,
      tag: newTag
    };
    setColumns({
      ...columns,
      "To Do": [...columns["To Do"], newTask]
    });
    setNewTitle("");
    setNewAssignee("");
    setNewDueDate("");
    setNewDescription("");
    setNewTag("");
  };

  const filterBy = (name) => {
    const filtered = loadFromStorage();
    const result = {};
    for (const key in filtered) {
      result[key] = filtered[key].filter((task) => task.assignedTo === name);
    }
    setColumns(result);
  };

  const openEdit = (col, idx) => {
    const task = columns[col][idx];
    setEditTask({ col, idx });
    setEditTitle(task.title);
    setEditAssignee(task.assignedTo);
    setEditDueDate(task.dueDate || "");
    setEditDescription(task.description || "");
    setEditTag(task.tag || "");
  };

  const saveEdit = () => {
    const colCopy = [...columns[editTask.col]];
    colCopy[editTask.idx] = {
      ...colCopy[editTask.idx],
      title: editTitle,
      assignedTo: editAssignee,
      dueDate: editDueDate,
      description: editDescription,
      tag: editTag
    };
    setColumns({ ...columns, [editTask.col]: colCopy });
    setEditTask(null);
  };

  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(today, { weekStartsOn: 1 }), i));
  const allTasks = Object.values(columns).flat();

  return (
    <div className="p-4 space-y-10 max-w-screen-xl mx-auto">
      {/* Form migliorato con griglia leggibile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="space-y-3">
          <Input placeholder="Titolo del task" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Input placeholder="Descrizione" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
        </div>
        <div className="space-y-3">
          <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
          <Select value={newTag} onValueChange={setNewTag}>
            <SelectTrigger><SelectValue placeholder="Priorità" /></SelectTrigger>
            <SelectContent>
              {tagOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Select value={newAssignee} onValueChange={setNewAssignee}>
            <SelectTrigger><SelectValue placeholder="Assegna a" /></SelectTrigger>
            <SelectContent>
              {teamMembers.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={addTask} className="w-full">➕ Aggiungi Task</Button>
        </div>
        <div className="md:col-span-3">
          <Select onValueChange={filterBy} defaultValue="">
            <SelectTrigger><SelectValue placeholder="🔍 Filtra per persona" /></SelectTrigger>
            <SelectContent>
              {teamMembers.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Colonne dei task */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(columns).map(([colName, tasks]) => (
          <div key={colName} className="space-y-4">
            <h2 className="text-xl font-bold">{colName}</h2>
            {tasks.map((task, index) => (
              <Card key={task.id} className="shadow-md">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${tagColors[task.tag]}`}>{task.tag}</span>
                  </div>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <p className="text-sm italic text-gray-500">Assegnato a: {task.assignedTo}</p>
                  {task.dueDate && <p className="text-sm">📅 {format(parseISO(task.dueDate), "dd/MM/yyyy")}</p>}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => moveCard(colName, "In Progress", index)}>➡️</Button>
                    <Button variant="outline" size="sm" onClick={() => moveCard(colName, "Done", index)}>✅</Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(colName, index)}>✏️</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteCard(colName, index)}>🗑️</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
