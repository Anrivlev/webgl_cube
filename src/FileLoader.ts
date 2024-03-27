import { Subject } from 'rxjs';

export class FileLoader {
  public static getUint8Array(url: string): Subject<Uint8Array> {
    const result = new Subject<Uint8Array>();
    fetch(url).then(response =>
      response.arrayBuffer().then(arrayBuffer => {
        console.log(arrayBuffer);
        result.next(new Uint8Array(arrayBuffer));
        result.complete();
      })
    );
    return result;
  }
}
