import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleService } from 'src/db/db.service';
import { employees } from 'src/db/schema/employee';
import { CreateEmployeeDto } from './dto/createEmployee.dto';
import { UpdateEmployeeDto } from './dto/updateEmployee.dto';
import { departments, offices } from './constants/allDeptOffice';
import { eq, sql, and } from 'drizzle-orm';
import { User } from 'src/db/schema/user.types';

@Injectable()
export class EmployeeService {
  constructor(private readonly dbService: DrizzleService) {}

  // Find a single employee by ID
  async findOneWithId(id: string) {
    const [employee] = await this.dbService.db
      .select()
      .from(employees)
      .where(eq(employees.id, id))
      .limit(1); // single row

    return employee;
  }

  // Create a new employee
  async createEmployee(dto: CreateEmployeeDto, user: User) {
    let category: 'Department' | 'Office' | null = null;
    let serial: number | null = null;

    const dept = departments.find((d) => d.value === dto.department);
    const office = offices.find((o) => o.value === dto.department);

    if (dept) {
      category = 'Department';
      serial = dept.serial;
    } else if (office) {
      category = 'Office';
      serial = office.serial;
    } else {
      throw new BadRequestException(
        `Invalid department: ${dto.department}. Must be a valid Department or Office.`,
      );
    }

    const [savedEmployee] = await this.dbService.db
      .insert(employees)
      .values({
        ...dto,
        type: category,
        serial,
        user_id: user.id,
      })
      .returning();

    return savedEmployee;
  }

  // Update employee
  async updateEmployee(id: string, dto: UpdateEmployeeDto) {
    const employee = await this.findOneWithId(id);
    if (!employee) throw new NotFoundException('Employee not found');

    const [updatedEmployee] = await this.dbService.db
      .update(employees)
      .set(dto)
      .where(eq(employees.id, id))
      .returning();

    return updatedEmployee;
  }

  // Delete employee
  async deleteEmployee(id: string) {
    await this.dbService.db.delete(employees).where(eq(employees.id, id));
  }

  // Get all employees
  async getAllEmployees() {
    return await this.dbService.db
      .select()
      .from(employees)
      .orderBy(sql`${employees.created_at} DESC`);
  }

  // Get all published employees (with email/phone masking)
  async showAllEmployees() {
    const result = await this.dbService.db
      .select()
      .from(employees)
      .where(eq(employees.is_published, true))
      .orderBy(sql`${employees.sorting_order} ASC`);

    return result.map((emp) => ({
      ...emp,
      email: emp.show_email ? emp.email : null,
      official_phone: emp.show_official_phone ? emp.official_phone : null,
      personal_phone: emp.show_personal_phone ? emp.personal_phone : null,
    }));
  }

  // Get all departments
  async getAllDepartments(): Promise<string[]> {
    const result = await this.dbService.db
      .select({
        department: employees.department,
        serial: sql`MIN(${employees.serial})`,
      })
      .from(employees)
      .where(eq(employees.type, 'Department'))
      .groupBy(employees.department)
      .orderBy(sql`serial ASC`);

    return result.map((row) => row.department);
  }

  // Get all offices
  async getAllOffices(): Promise<string[]> {
    const result = await this.dbService.db
      .select({
        department: employees.department,
        serial: sql`MIN(${employees.serial})`,
      })
      .from(employees)
      .where(eq(employees.type, 'Office'))
      .groupBy(employees.department)
      .orderBy(sql`serial ASC`);

    return result.map((row) => row.department);
  }

  // Employees by department
  async getEmployeesByDepartment(department: string) {
    const result = await this.dbService.db
      .select()
      .from(employees)
      .where(
        and(
          eq(employees.department, department),
          eq(employees.is_published, true),
          eq(employees.type, 'Department'),
        ),
      )
      .orderBy(sql`${employees.sorting_order} ASC`);

    return result.map((emp) => ({
      ...emp,
      email: emp.show_email ? emp.email : null,
      official_phone: emp.show_official_phone ? emp.official_phone : null,
      personal_phone: emp.show_personal_phone ? emp.personal_phone : null,
    }));
  }

  // Employees by office
  async getEmployeesByOffice(office: string) {
    const result = await this.dbService.db
      .select()
      .from(employees)
      .where(
        and(
          eq(employees.department, office),
          eq(employees.is_published, true),
          eq(employees.type, 'Office'),
        ),
      )
      .orderBy(sql`${employees.sorting_order} ASC`);

    return result.map((emp) => ({
      ...emp,
      email: emp.show_email ? emp.email : null,
      official_phone: emp.show_official_phone ? emp.official_phone : null,
      personal_phone: emp.show_personal_phone ? emp.personal_phone : null,
    }));
  }
}
