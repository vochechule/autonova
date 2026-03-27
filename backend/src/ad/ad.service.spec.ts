import 'reflect-metadata';
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { Test, TestingModule } from '@nestjs/testing';
import { AdService } from './ad.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AdService', () => {
  let service: AdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdService>(AdService);
  });

  it('should be defined', () => {
    assert.ok(service);
  });
});
