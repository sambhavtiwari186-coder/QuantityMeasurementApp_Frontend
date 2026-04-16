import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  private apiUrl = 'https://quantitymeasurmentapp-qyyx.onrender.com/api/measurement';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  private getMeasurementType(unit: string): string {
    const key = unit?.toString()?.toUpperCase()?.trim() ?? '';
    
    // Length
    if (['FEET', 'INCH', 'YARD', 'CENTIMETER', 'KM', 'MILE', 'KILOMETER'].includes(key)) {
      return 'Length';
    }
    
    // Volume
    if (['LITRE', 'MILLILITRE', 'GALLON', 'ML'].includes(key)) {
      return 'Volume';
    }
    
    // Weight
    if (['KILOGRAM', 'GRAM', 'MILLIGRAM', 'TONNE', 'POUND', 'KG'].includes(key)) {
      return 'Weight';
    }
    
    // Temperature
    if (['CELSIUS', 'FAHRENHEIT', 'KELVIN'].includes(key)) {
      return 'Temperature';
    }
    
    // Time
    if (['SECOND', 'MINUTE', 'HOUR', 'DAY', 'WEEK'].includes(key)) {
      return 'Time';
    }
    
    // Area
    if (['SQUAREINCH', 'SQUAREFOOT', 'SQUAREMETER', 'ACRE', 'HECTARE'].includes(key)) {
      return 'Area';
    }
    
    // Speed
    if (['KMPH', 'MPH', 'MPS', 'KNOT'].includes(key)) {
      return 'Speed';
    }
    
    // Energy
    if (['JOULE', 'CALORIE', 'KILOCALORIE', 'KILOJOULE', 'MEGAJOULE', 'GIGAJOULE', 'WATTHOUR'].includes(key)) {
      return 'Energy';
    }
    
    // Pressure
    if (['PASCAL', 'BAR', 'PSI', 'KILOPASCAL', 'ATMOSPHERE', 'TORR'].includes(key)) {
      return 'Pressure';
    }
    
    // Angle
    if (['DEGREE', 'RADIAN', 'GRADIAN'].includes(key)) {
      return 'Angle';
    }
    
    // Power
    if (['WATT', 'KILOWATT', 'MEGAWATT', 'HORSEPOWER'].includes(key)) {
      return 'Power';
    }
    
    return '';
  }

  private annotateQuantity(quantity: any): any {
    return {
      value: quantity?.value ?? 0,
      unit: quantity?.unit ?? '',
      measurementType: this.getMeasurementType(quantity?.unit)
    };
  }

  convert(source: any, targetUnit: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/convert`, { source: this.annotateQuantity(source), targetUnit }, { headers: this.getHeaders() });
  }

  compare(q1: any, q2: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/compare`, { quantity1: this.annotateQuantity(q1), quantity2: this.annotateQuantity(q2) }, { headers: this.getHeaders() });
  }

  add(q1: any, q2: any, targetUnit: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { quantity1: this.annotateQuantity(q1), quantity2: this.annotateQuantity(q2), targetUnit }, { headers: this.getHeaders() });
  }

  subtract(q1: any, q2: any, targetUnit: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/subtract`, { quantity1: this.annotateQuantity(q1), quantity2: this.annotateQuantity(q2), targetUnit }, { headers: this.getHeaders() });
  }

  multiply(q1: any, q2: any, targetUnit: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/multiply`, { quantity1: this.annotateQuantity(q1), quantity2: this.annotateQuantity(q2), targetUnit }, { headers: this.getHeaders() });
  }

  divide(q1: any, q2: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/divide`, { quantity1: this.annotateQuantity(q1), quantity2: this.annotateQuantity(q2) }, { headers: this.getHeaders() });
  }

  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/history`, { headers: this.getHeaders() });
  }
}
