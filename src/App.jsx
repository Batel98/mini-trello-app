// MINI TRELLO - FIX UI BREAK & UX MIGLIORATO
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";

const teamMembers = ["Nicola", "Andrea", "Mirko", "Georgina"];
const tagOptions = ["Urgente", "Normale", "Bassa Priorità"];
const tagColors = {
  Urgente: "bg-red-200 text-red-800",
  Normale: "bg-yellow-200 text-yellow-800",
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

  useEffect(() => {
    localStorage.setItem("taskColumns", JSON.stringify(columns));
  }, [columns]);

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
    setColumns(prev => ({
      ...prev,
      "To Do": [...prev["To Do"], newTask]
    }));
    setNewTitle("");
    setNewAssignee("");
    setNewDueDate("");
    setNewDescription("");
    setNewTag("");
  };

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

  const filterBy = (name) => {
    const filtered = loadFromStorage();
    const result = {};
    for (const key in filtered) {
      result[key] = filtered[key].filter((task) => task.assignedTo === name);
    }
    setColumns(result);
  };

  return (
    <div className="p-4 max-w-screen-xl mx-auto space-y-10">
      <div className="bg-white p-6 rounded-xl shadow-lg grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="space-y-2 z-10">
          <Input placeholder="Titolo del task" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Input placeholder="Descrizione" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
        </div>
        <div className="space-y-2 z-10">
          <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
          <div className="relative z-20">
            <Select value={newTag} onValueChange={setNewTag}>
              <SelectTrigger><SelectValue placeholder="Priorità" /></SelectTrigger>
              <SelectContent className="z-50">
                {tagOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2 z-10">
          <div className="relative z-20">
            <Select value={newAssignee} onValueChange={setNewAssignee}>
              <SelectTrigger><SelectValue placeholder="Assegna a" /></SelectTrigger>
              <SelectContent className="z-50">
                {teamMembers.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={addTask}>➕ Aggiungi Task</Button>
        </div>
        <div className="col-span-1 lg:col-span-3 z-10">
          <div className="relative z-20">
            <Select onValueChange={filterBy} defaultValue="">
              <SelectTrigger><SelectValue placeholder="🔍 Filtra per persona" /></SelectTrigger>
              <SelectContent className="z-50">
                {teamMembers.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(columns).map(([colName, tasks]) => (
          <div key={colName} className="bg-gray-50 p-4 rounded-xl shadow-md space-y-4">
            <h2 className="text-lg font-bold text-center text-gray-700 border-b pb-2">{colName}</h2>
            {tasks.length === 0 && <p className="text-sm text-center text-gray-400">Nessun task</p>}
            {tasks.map((task, index) => (
              <Card key={task.id} className="bg-white border border-gray-200">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold">{task.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${tagColors[task.tag]}`}>{task.tag}</span>
                  </div>
                  {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                  <p className="text-sm italic text-gray-500">👤 {task.assignedTo}</p>
                  {task.dueDate && <p className="text-sm">📅 {format(parseISO(task.dueDate), "dd/MM/yyyy")}</p>}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => moveCard(colName, "In Progress", index)}>➡️</Button>
                    <Button variant="outline" size="sm" onClick={() => moveCard(colName, "Done", index)}>✅</Button>
                    <Button variant="outline" size="sm" onClick={() => deleteCard(colName, index)}>🗑️</Button>
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

