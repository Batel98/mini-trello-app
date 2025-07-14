// MINI TRELLO — VERSIONE FUNZIONANTE CON SELECT HTML
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";

const teamMembers = ["Nicola", "Andrea", "Mirko", "Georgina"];
const tagOptions = ["Urgente", "Normale", "Bassa Priorità"];
const tagColors = {
  Urgente: "bg-red-100 text-red-800 border border-red-300",
  Normale: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  "Bassa Priorità": "bg-green-100 text-green-800 border border-green-300"
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
    if (!newTitle.trim() || !newAssignee || !newTag) {
      alert("Compila tutti i campi obbligatori");
      return;
    }
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
    <div className="p-6 max-w-screen-2xl mx-auto space-y-10 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">📋 Mini Trello</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Input placeholder="Titolo" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />

          <select className="w-full border rounded px-3 py-2" value={newTag} onChange={(e) => setNewTag(e.target.value)}>
            <option value="">Priorità</option>
            {tagOptions.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <select className="w-full border rounded px-3 py-2" value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)}>
            <option value="">Assegna a</option>
            {teamMembers.map((member) => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
        </div>

        <Input placeholder="Descrizione" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
        <Button className="w-full sm:w-fit self-end" onClick={addTask}>➕ Aggiungi Task</Button>

        <div className="pt-4">
          <select className="w-full md:w-64 border rounded px-3 py-2" onChange={(e) => filterBy(e.target.value)}>
            <option value="">🔍 Filtra per persona</option>
            {teamMembers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(columns).map(([colName, tasks]) => (
          <div key={colName} className="bg-white p-4 rounded-xl shadow-md space-y-4 min-h-[200px]">
            <h2 className="text-lg font-bold text-center text-gray-700 border-b pb-2">{colName}</h2>
            {tasks.length === 0 && <p className="text-sm text-center text-gray-400">Nessun task</p>}
            {tasks.map((task, index) => (
              <Card key={task.id} className="bg-white border border-gray-200">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold truncate max-w-[60%]">{task.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${tagColors[task.tag]}`}>{task.tag}</span>
                  </div>
                  {task.description && <p className="text-sm text-gray-600 line-clamp-3">{task.description}</p>}
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
