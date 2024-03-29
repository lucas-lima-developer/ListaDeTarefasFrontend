import { Injectable } from '@angular/core';
import { Task } from './task';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'https://localhost:7173/api/tarefa';

  private tasksSubject = new BehaviorSubject<Task[]>([]);

  constructor(private http: HttpClient, private userService: UserService) {}

  getTasks() : Observable<Task[]> {
    const authToken = this.userService.getToken().getValue();

    if (!authToken) {
      console.error('Token ausente, Usuário não autenticado')
      return new Observable();
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    });

    const options = { headers: headers };

    this.http.get<Task[]>(this.apiUrl, options).subscribe({
      next: tasks => {
        this.tasksSubject.next(tasks)
      }
    })
    
    return this.tasksSubject;
  }

  createTask(title: string | null | undefined, description : string | null | undefined) {
    const authToken = this.userService.getToken().getValue();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    })

    const options = { headers: headers };

    const body = { title, description };

    const task = this.http.post<Task>(this.apiUrl, body, options).subscribe({
      next: newTask => {
        const currentTasks = this.tasksSubject.getValue();
        const uptadetedTasks = [...currentTasks, newTask];
        this.tasksSubject.next(uptadetedTasks);
      }
    });
  }

  updateTask(id: number, title: string, description: string, isCompleted: boolean) {
    const authToken = this.userService.getToken().getValue();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    })

    const options = { headers: headers };

    const body = { id, title, description, isCompleted };

    this.http.put<Task>(`${this.apiUrl}/${id}`, body, options).subscribe({
      next: (taskUpdated : Task) => {
        const currentTasks = this.tasksSubject.getValue();
        const uptadetedTasks = currentTasks.map(task => task.id == taskUpdated.id ? taskUpdated : task);
        this.tasksSubject.next(uptadetedTasks)
      }
    });
  }

  deleteTask(id: number) {
    const authToken = this.userService.getToken().getValue();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${authToken}`
    })

    const options = { headers: headers };

    this.http.delete(`${this.apiUrl}/${id}`, options).subscribe({
      next: taskDeleted => {
        const currentTasks = this.tasksSubject.getValue();
        const uptadetedTasks = currentTasks.filter(task => task.id !== id);
        this.tasksSubject.next(uptadetedTasks);
      }
    });
  }
}
