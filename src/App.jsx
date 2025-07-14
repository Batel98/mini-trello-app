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
    <div className="p-4 space-y-8 max-w-screen-xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Titolo del task" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
        <Input placeholder="Descrizione" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
        <Select value={newAssignee} onValueChange={setNewAssignee}>
          <SelectTrigger><SelectValue placeholder="Assegna a" /></SelectTrigger>
          <SelectContent>
            {teamMembers.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={newTag} onValueChange={setNewTag}>
          <SelectTrigger><SelectValue placeholder="Priorità" /></SelectTrigger>
          <SelectContent>
            {tagOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={addTask}>➕ Aggiungi</Button>
        <Select onValueChange={filterBy} defaultValue="">
          <SelectTrigger><SelectValue placeholder="🔍 Filtra per persona" /></SelectTrigger>
          <SelectContent>
            {teamMembers.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(columns).map(([col, tasks]) => (
          <div key={col} className="bg-white rounded-xl shadow p-3 border border-gray-200">
            <h2 className="text-lg font-bold mb-3 text-center text-blue-600">{col}</h2>
            {tasks.map((card, idx) => (
              <Card key={card.id} className="mb-3">
                <CardContent className="p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg">{card.title}</p>
                    <span className={`text-xs px-2 py-1 rounded ${tagColors[card.tag]}`}>{card.tag}</span>
                  </div>
                  <p className="text-sm text-gray-600">👤 {card.assignedTo}</p>
                  {card.dueDate && <p className="text-sm text-gray-500">📅 {card.dueDate}</p>}
                  {card.description && <p className="text-sm text-gray-700 italic">{card.description}</p>}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {Object.keys(columns).filter(t => t !== col).map(t => (
                      <Button key={t} size="sm" onClick={() => moveCard(col, t, idx)}>Sposta in {t}</Button>
                    ))}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => openEdit(col, idx)}>✏️</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <Label className="mb-1">Titolo</Label>
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                        <Label className="mt-4 mb-1">Assegnato a</Label>
                        <Select value={editAssignee} onValueChange={setEditAssignee}>
                          <SelectTrigger><SelectValue placeholder="Persona" /></SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Label className="mt-4 mb-1">Scadenza</Label>
                        <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                        <Label className="mt-4 mb-1">Descrizione</Label>
                        <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                        <Label className="mt-4 mb-1">Priorità</Label>
                        <Select value={editTag} onValueChange={setEditTag}>
                          <SelectTrigger><SelectValue placeholder="Priorità" /></SelectTrigger>
                          <SelectContent>
                            {tagOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button className="mt-4" onClick={saveEdit}>💾 Salva</Button>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="destructive" onClick={() => deleteCard(col, idx)}>🗑️</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">📆 Timeline Settimanale</h2>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day, i) => (
            <div key={i} className="bg-blue-50 p-3 rounded shadow-sm border">
              <p className="font-semibold text-center text-sm text-blue-800">{format(day, "EEEE dd/MM")}</p>
              {allTasks.filter(task => task.dueDate && isSameDay(parseISO(task.dueDate), day)).map(task => (
                <div key={task.id} className={`mt-2 p-2 rounded text-sm ${tagColors[task.tag]}`}>
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-xs">👤 {task.assignedTo}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


