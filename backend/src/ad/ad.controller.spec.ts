import 'reflect-metadata';
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { Test, TestingModule } from '@nestjs/testing';
import { AdController } from './ad.controller';
import { AdService } from './ad.service';

describe('AdController', () => {
  let controller: AdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdController],
      providers: [
        {
          provide: AdService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AdController>(AdController);
  });

  it('should be defined', () => {
    assert.ok(controller);
  });
});
